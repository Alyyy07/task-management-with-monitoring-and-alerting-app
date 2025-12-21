import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth.service.js";
import { authRepository } from "../auth.repository.js";
import * as passwordUtils from "../../../utils/password.js";

vi.mock("../auth.repository", () => ({
  authRepository: {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
    createRefreshToken: vi.fn(),
    findValidRefreshToken: vi.fn(),
    revokeRefreshToken: vi.fn(),
  },
}));

describe("AuthService", () => {
  const service = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login user with valid credentials", async () => {
    (authRepository.findByEmail as any).mockResolvedValue({
      id: "1",
      email: "test@mail.com",
      password: "hashed",
    });

    vi.spyOn(passwordUtils, "comparePassword").mockResolvedValue(true);
    (authRepository.createRefreshToken as any).mockResolvedValue(
      "new-refresh-token"
    );

    const { user, refreshToken } = await service.login(
      "test@mail.com",
      "password"
    );

    expect(user.email).toBe("test@mail.com");
    expect(refreshToken).toBe("new-refresh-token");

    expect(authRepository.findByEmail).toHaveBeenCalledWith("test@mail.com");
    expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
      "password",
      "hashed"
    );
    expect(authRepository.createRefreshToken).toHaveBeenCalledWith("1");
  });

  it("should throw error if email is not found", async () => {
    (authRepository.findByEmail as any).mockResolvedValue(null);

    const spy = vi.spyOn(passwordUtils, "comparePassword");

    await expect(
      service.login("notfound@mail.com", "password")
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });

    expect(spy).not.toHaveBeenCalled();
    expect(authRepository.findByEmail).toHaveBeenCalledWith(
      "notfound@mail.com"
    );
  });

  it("should throw error if password is invalid", async () => {
    (authRepository.findByEmail as any).mockResolvedValue({
      id: "1",
      email: "test@mail.com",
      password: "hashed-password",
    });

    vi.spyOn(passwordUtils, "comparePassword").mockResolvedValue(false);
    const refresh = vi.spyOn(authRepository, "createRefreshToken");

    await expect(
      service.login("test@mail.com", "wrong-password")
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    expect(authRepository.findByEmail).toHaveBeenCalledWith("test@mail.com");
    expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
      "wrong-password",
      "hashed-password"
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it("should register user successfully", async () => {
    (authRepository.findByEmail as any).mockResolvedValue(null);

    vi.spyOn(passwordUtils, "hashPassword").mockResolvedValue(
      "hashed-password"
    );
    vi.spyOn(authRepository, "createRefreshToken").mockResolvedValue(
      "new-refresh-token"
    );

    (authRepository.createUser as any).mockResolvedValue({
      id: "user-1",
      email: "test@mail.com",
      password: "hashed-password",
    });

    const result = await service.register("test@mail.com", "plain-password");

    expect(authRepository.findByEmail).toHaveBeenCalledWith("test@mail.com");

    expect(authRepository.createUser).toHaveBeenCalledWith(
      "test@mail.com",
      "hashed-password"
    );

    expect(result).toEqual({
      id: "user-1",
      email: "test@mail.com",
    });
  });

  it("should throw error if user already exists", async () => {
    (authRepository.findByEmail as any).mockResolvedValue({
      id: "1",
      email: "test@mail.com",
      password: "hashed",
    });

    const hashSpy = vi.spyOn(passwordUtils, "hashPassword");

    await expect(
      service.register("test@mail.com", "password")
    ).rejects.toMatchObject({
      code: "USER_EXISTS",
    });

    expect(authRepository.createUser).not.toHaveBeenCalled();
    expect(hashSpy).not.toHaveBeenCalled();
  });
});

describe("AuthService - Refresh Token", () => {
  const service = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should rotate refresh token and issue new access token", async () => {
    const oldToken = "old-refresh-token";

    (authRepository.findValidRefreshToken as any).mockResolvedValue({
      id: "rt-1",
      token: oldToken,
      userId: "user-1",
    });

    (authRepository.createRefreshToken as any).mockResolvedValue(
      "new-refresh-token"
    );

    (authRepository.revokeRefreshToken as any).mockResolvedValue(undefined);

    const result = await service.refreshToken(oldToken);

    expect(authRepository.findValidRefreshToken).toHaveBeenCalledWith(oldToken);

    expect(authRepository.revokeRefreshToken).toHaveBeenCalledWith("rt-1");

    expect(authRepository.createRefreshToken).toHaveBeenCalledWith("user-1");

    expect(result).toEqual({
      userId: "user-1",
      refreshToken: "new-refresh-token",
    });
  });

  it("should throw error if refresh token is invalid", async () => {
    (authRepository.findValidRefreshToken as any).mockResolvedValue(null);

    await expect(service.refreshToken("invalid-token")).rejects.toMatchObject({
      code: "INVALID_REFRESH_TOKEN",
    });

    expect(authRepository.revokeRefreshToken).not.toHaveBeenCalled();
    expect(authRepository.createRefreshToken).not.toHaveBeenCalled();
  });

  it("should not allow reused refresh token", async () => {
  (authRepository.findValidRefreshToken as any).mockResolvedValue(null);

  await expect(
    service.refreshToken("old-token")
  ).rejects.toMatchObject({
    code: "INVALID_REFRESH_TOKEN",
  });
});

});
