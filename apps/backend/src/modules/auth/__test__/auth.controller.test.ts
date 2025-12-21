import { describe, it, expect, vi, beforeEach } from "vitest";
import fastify from "fastify";
import { authRoutes } from "../auth.routes.js";
import { AuthError } from "../auth.errors.js";

describe("Auth Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const app = fastify();
  app.decorate("jwt", {
    sign: vi.fn().mockReturnValue("access-token"),
  } as any);

  const mockService = {
    register: vi.fn().mockResolvedValue({
      id: "user-1",
      email: "test@mail.com",
    }),
    login: vi.fn().mockResolvedValue({
      user: { id: "user-1", email: "test@mail.com" },
      refreshToken: "refresh-token",
      accessToken: "access-token",
    }),
    refreshToken: vi.fn(),
    revokeRefreshToken: vi.fn(),
  };

  app.register(authRoutes, {
    prefix: "/auth",
    authService: mockService,
  });
  describe("register", () => {
    it("should return 201 when register success", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "test@mail.com",
          password: "password",
        },
      });

      expect(res.statusCode).toBe(201);
      expect(mockService.register).toHaveBeenCalled();
    });
    it("should return 409 when user already exists", async () => {
      mockService.register = vi
        .fn()
        .mockRejectedValueOnce(new AuthError("USER_EXISTS"));
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "test@mail.com",
          password: "password",
        },
      });
      expect(res.statusCode).toBe(409);
      expect(mockService.register).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return 200 and tokens when login success", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "test@mail.com",
          password: "password",
        },
      });

      expect(res.statusCode).toBe(200);
      expect(mockService.login).toHaveBeenCalled();
    });

    it("should return 401 when login fails", async () => {
      mockService.login = vi
        .fn()
        .mockRejectedValueOnce(new AuthError("INVALID_CREDENTIALS"));
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "test@mail.com",
          password: "wrong-password",
        },
      });
      expect(res.statusCode).toBe(401);
      expect(mockService.login).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should return 204 when logout success", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/logout",
        payload: {
          refreshToken: "refresh-token",
        },
      });
      expect(res.statusCode).toBe(204);
      expect(mockService.revokeRefreshToken).toHaveBeenCalled();
    });

    it("should return 401 when logout fails", async () => {
      mockService.revokeRefreshToken = vi
        .fn()
        .mockRejectedValueOnce(new AuthError("INVALID_REFRESH_TOKEN"));
      const res = await app.inject({
        method: "POST",
        url: "/auth/logout",
        payload: {
          refreshToken: "invalid-refresh-token",
        },
      });
      expect(res.statusCode).toBe(401);
      expect(mockService.revokeRefreshToken).toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    it("should return 200 and new tokens when refresh success", async () => {
      mockService.refreshToken = vi.fn().mockResolvedValue({
        userId: "user-1",
        refreshToken: "new-refresh-token",
      });
      const res = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: "refresh-token",
        },
      });
      expect(res.statusCode).toBe(200);
      expect(mockService.refreshToken).toHaveBeenCalled();
    });

    it("should return 401 when refresh fails", async () => {
      mockService.refreshToken = vi
        .fn()
        .mockRejectedValueOnce(new AuthError("INVALID_REFRESH_TOKEN"));
      const res = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: "invalid-refresh-token",
        },
      });
      expect(res.statusCode).toBe(401);
      expect(mockService.refreshToken).toHaveBeenCalled();
    });
  });
});
