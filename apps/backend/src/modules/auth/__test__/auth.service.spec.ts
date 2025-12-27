import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth.service.js";
import { AuthError, AuthErrorCode } from "../auth.errors.js";
import * as passwordUtils from "../../../utils/password.js";

const authRepositoryMock = {
  findByEmail: vi.fn(),
  createUser: vi.fn(),
  revokeAllRefreshTokens: vi.fn(),
  storeRefreshToken: vi.fn(),
  findValidRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
  storeCsrfToken: vi.fn(),
  revokeCsrfTokens: vi.fn(),
};

vi.mock("../../../utils/password.js", () => ({
  comparePassword: vi.fn().mockResolvedValue(true),
  hashPassword: vi.fn().mockResolvedValue("hashed"),
}));

const tokenServiceMock = {
  signAccessToken: vi.fn(),
};

function buildService() {
  return new AuthService(authRepositoryMock as any, tokenServiceMock as any);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Auth Service", () => {
  it("logs in user and issues tokens", async () => {
    authRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
      password: "hashed",
    });

    authRepositoryMock.revokeAllRefreshTokens.mockResolvedValue(undefined);
    authRepositoryMock.storeRefreshToken.mockResolvedValue(undefined);
    authRepositoryMock.storeCsrfToken.mockResolvedValue(undefined);

    tokenServiceMock.signAccessToken.mockReturnValue("access-token");

    const service = buildService();

    const result = await service.login("test@test.com", "password");

    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: expect.any(String),
      csrfToken: expect.any(String),
    });

    expect(authRepositoryMock.revokeAllRefreshTokens).toHaveBeenCalledWith(
      "user-1"
    );

    expect(tokenServiceMock.signAccessToken).toHaveBeenCalledWith({
      userId: "user-1",
    });
  });

  it("throws INVALID_CREDENTIALS if user does not exist", async () => {
    authRepositoryMock.findByEmail.mockResolvedValue(null);

    const service = buildService();

    await expect(service.login("nope@test.com", "password")).rejects.toEqual(
      new AuthError(AuthErrorCode.INVALID_CREDENTIALS)
    );
  });

  it("throws INVALID_CREDENTIALS if password is wrong", async () => {
    authRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      password: "hashed",
    });
    // Ensure password comparison fails for this test
    (passwordUtils.comparePassword as any).mockResolvedValue(false);
    const service = buildService();

    await expect(
      service.login("test@test.com", "wrong-password")
    ).rejects.toEqual(new AuthError(AuthErrorCode.INVALID_CREDENTIALS));
  });

  it("rotates refresh token and issues new access token", async () => {
    authRepositoryMock.findValidRefreshToken.mockResolvedValue({
      id: "rt-1",
      userId: "user-1",
    });

    authRepositoryMock.revokeRefreshToken.mockResolvedValue(undefined);
    authRepositoryMock.storeRefreshToken.mockResolvedValue(undefined);
    authRepositoryMock.storeCsrfToken.mockResolvedValue(undefined);

    tokenServiceMock.signAccessToken.mockReturnValue("new-access-token");

    const service = buildService();

    const result = await service.refresh("old-refresh-token");

    expect(result).toEqual({
      accessToken: "new-access-token",
      refreshToken: expect.any(String),
      csrfToken: expect.any(String),
    });

    expect(authRepositoryMock.revokeRefreshToken).toHaveBeenCalledWith("rt-1");
  });

  it("throws INVALID_REFRESH_TOKEN if refresh token is invalid", async () => {
    authRepositoryMock.findValidRefreshToken.mockResolvedValue(null);

    const service = buildService();

    await expect(service.refresh("invalid-token")).rejects.toEqual(
      new AuthError(AuthErrorCode.INVALID_REFRESH_TOKEN)
    );
  });

  it("revokes refresh token and csrf tokens on logout", async () => {
    authRepositoryMock.findValidRefreshToken.mockResolvedValue({
      id: "rt-1",
      userId: "user-1",
    });

    authRepositoryMock.revokeCsrfTokens.mockResolvedValue(undefined);
    authRepositoryMock.revokeRefreshToken.mockResolvedValue(undefined);

    const service = buildService();

    await service.revokeRefreshToken("refresh-token");

    expect(authRepositoryMock.revokeCsrfTokens).toHaveBeenCalledWith("user-1");

    expect(authRepositoryMock.revokeRefreshToken).toHaveBeenCalledWith("rt-1");
  });
});
