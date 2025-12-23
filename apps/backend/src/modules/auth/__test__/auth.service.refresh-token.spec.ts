import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth.service.js";
import { authRepository } from "../auth.repository.js";
import { AuthError } from "../auth.errors.js";

vi.mock("../auth.repository", () => ({
  authRepository: {
    findValidRefreshToken: vi.fn(),
    revokeRefreshToken: vi.fn(),
    createRefreshToken: vi.fn(),
    createCsrfToken: vi.fn(),
  },
}));

describe("AuthService - refreshToken", () => {
  const service = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should rotate refresh token and return new refresh token", async () => {
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

    const revokeCall = (authRepository.revokeRefreshToken as any).mock
      .invocationCallOrder[0];

    const createCall = (authRepository.createRefreshToken as any).mock
      .invocationCallOrder[0];

    expect(authRepository.findValidRefreshToken).toHaveBeenCalledWith(oldToken);

    expect(authRepository.revokeRefreshToken).toHaveBeenCalledWith("rt-1");

    expect(authRepository.createRefreshToken).toHaveBeenCalledWith("user-1");

    expect(revokeCall).toBeLessThan(createCall);

    expect(result).toEqual({
      userId: "user-1",
      newRefresh: "new-refresh-token",
    });
  });

  it("should throw error if refresh token invalid", async () => {
    (authRepository.findValidRefreshToken as any).mockResolvedValue(null);

    await expect(service.refreshToken("invalid-token")).rejects.toBeInstanceOf(
      AuthError
    );
  });
});
