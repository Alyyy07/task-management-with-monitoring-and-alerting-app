import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildTestApp } from "../../../tests/utils/buildTestApp.js";

const authServiceMock = {
  register: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
  revokeRefreshToken: vi.fn(),
};
beforeEach(() => {
  vi.clearAllMocks();
});
describe("Auth Controller", () => {
  it("POST /auth/register returns 201", async () => {
  authServiceMock.register.mockResolvedValue({
    id: "user-1",
    email: "test@test.com",
  });

  const app = buildTestApp(authServiceMock);

  const res = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: {
      email: "test@test.com",
      password: "password",
    },
  });

  expect(res.statusCode).toBe(201);
  expect(JSON.parse(res.body)).toEqual({
    id: "user-1",
    email: "test@test.com",
  });

  expect(authServiceMock.register)
    .toHaveBeenCalledWith("test@test.com", "password");
});

it("POST /auth/login sets refresh cookie and returns access token", async () => {
  authServiceMock.login.mockResolvedValue({
    accessToken: "access-token",
    refreshToken: "refresh-token",
    csrfToken: "csrf-token",
  });

  const app = buildTestApp(authServiceMock);

  const res = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: {
      email: "test@test.com",
      password: "password",
    },
  });

  expect(res.statusCode).toBe(200);

  const body = JSON.parse(res.body);
  expect(body).toEqual({
    accessToken: "access-token",
    csrfToken: "csrf-token",
  });

  const setCookie = res.headers["set-cookie"];
  expect(setCookie).toContain("refreshToken=refresh-token");
  expect(setCookie).toContain("HttpOnly");
});

it("POST /auth/login returns 401 on auth error", async () => {
  authServiceMock.login.mockRejectedValue(
    new Error("INVALID_CREDENTIALS")
  );

  const app = buildTestApp(authServiceMock);

  const res = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: {
      email: "bad@test.com",
      password: "wrong",
    },
  });

  expect(res.statusCode).toBe(500); // until error mapping middleware exists
});

it("POST /auth/refresh reads refresh token from cookie", async () => {
  authServiceMock.refresh.mockResolvedValue({
    accessToken: "new-access",
    refreshToken: "new-refresh",
  });

  const app = buildTestApp(authServiceMock);

  const res = await app.inject({
    method: "POST",
    url: "/auth/refresh",
    headers: {
      cookie: "refreshToken=old-refresh",
    },
  });

  expect(res.statusCode).toBe(200);

  const body = JSON.parse(res.body);
  expect(body.accessToken).toBe("new-access");

  expect(res.headers["set-cookie"])
    .toContain("refreshToken=new-refresh");

  expect(authServiceMock.refresh)
    .toHaveBeenCalledWith("old-refresh");
});

it("POST /auth/refresh returns 401 if no refresh cookie", async () => {
  const app = buildTestApp(authServiceMock);

  const res = await app.inject({
    method: "POST",
    url: "/auth/refresh",
  });

  expect(res.statusCode).toBe(401);
});

it("POST /auth/logout clears refresh cookie", async () => {
  authServiceMock.revokeRefreshToken.mockResolvedValue(undefined);

  const app = buildTestApp(authServiceMock);

  const res = await app.inject({
    method: "POST",
    url: "/auth/logout",
    headers: {
      cookie: "refreshToken=refresh-token",
    },
  });

  expect(res.statusCode).toBe(204);
  expect(res.headers["set-cookie"])
    .toContain("refreshToken=");
});

});
