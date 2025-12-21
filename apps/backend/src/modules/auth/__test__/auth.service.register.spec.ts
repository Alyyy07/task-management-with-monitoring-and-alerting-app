import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth.service.js";
import { authRepository } from "../auth.repository.js";
import * as passwordUtils from "../../../utils/password.js";

vi.mock("../auth.repository", () => ({
  authRepository: {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
  },
}));

describe("AuthService - register", () => {
  const service = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register user successfully", async () => {
    (authRepository.findByEmail as any).mockResolvedValue(null);

    vi.spyOn(passwordUtils, "hashPassword").mockResolvedValue(
      "hashed-password"
    );

    (authRepository.createUser as any).mockResolvedValue({
      id: "user-1",
      email: "test@mail.com",
    });

    const result = await service.register("test@mail.com", "password");

    expect(result).toEqual({
      id: "user-1",
      email: "test@mail.com",
    });
  });

  it("should throw error if user already exists", async () => {
    (authRepository.findByEmail as any).mockResolvedValue({
      id: "user-1",
      email: "test@mail.com",
    });

    await expect(
      service.register("test@mail.com", "password")
    ).rejects.toMatchObject({
      code: "USER_EXISTS",
    });
  });
});
