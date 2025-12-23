import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth.service.js";
import { authRepository } from "../auth.repository.js";
import * as passwordUtils from "../../../utils/password.js";
import { AuthError } from "../auth.errors.js";
import { csrfGuard } from "../../../plugins/csrf.js";

vi.mock("../auth.repository", () => ({
  authRepository: {
    findByEmail: vi.fn(),
    createRefreshToken: vi.fn(),
    createCsrfToken: vi.fn(),
  },
}));

describe("AuthService - login", () => {
  const service = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login user with valid credentials", async () => {
    (authRepository.findByEmail as any).mockResolvedValue({
      id: "user-1",
      email: "test@mail.com",
      password: "hashed",
    });

    vi.spyOn(passwordUtils, "comparePassword").mockResolvedValue(true);

    (authRepository.createRefreshToken as any).mockResolvedValue(
      "new-refresh-token"
    );

    const result = await service.login("test@mail.com", "password");

    expect(result.user.email).toBe("test@mail.com");
    expect(result.refreshToken).toBe("new-refresh-token");
  });

  it("should throw error if email not found", async () => {
    (authRepository.findByEmail as any).mockResolvedValue(null);

    await expect(
      service.login("notfound@mail.com", "password")
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("should throw error if password is invalid", async () => {
    (authRepository.findByEmail as any).mockResolvedValue({
      id: "user-1",
      email: "test@mail.com",
      password: "hashed",
    });

    vi.spyOn(passwordUtils, "comparePassword").mockResolvedValue(false);

    await expect(
      service.login("test@mail.com", "wrong-password")
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("should issue csrf token on login", async () => {
    (authRepository.createCsrfToken as any).mockResolvedValue("csrf-token");
    vi.spyOn(passwordUtils, "comparePassword").mockResolvedValue(true);

    const result = await service.login("test@mail.com", "password");

    expect(result.csrfToken).toBe("csrf-token");
  });
});
