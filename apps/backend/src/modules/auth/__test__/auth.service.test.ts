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

    const user = await service.login("test@mail.com", "password");

    expect(user.email).toBe("test@mail.com");
    expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
      "password",
      "hashed"
    );
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
  });

  it("should throw error if password is invalid", async () => {
    (authRepository.findByEmail as any).mockResolvedValue({
      id: "1",
      email: "test@mail.com",
      password: "hashed-password",
    });

    vi.spyOn(passwordUtils, "comparePassword").mockResolvedValue(false);

    await expect(
      service.login("test@mail.com", "wrong-password")
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
  });

  it("should register user successfully", async () => {
    (authRepository.findByEmail as any).mockResolvedValue(null);

    vi.spyOn(passwordUtils, "hashPassword").mockResolvedValue(
      "hashed-password"
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
