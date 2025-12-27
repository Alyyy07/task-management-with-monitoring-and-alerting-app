import { beforeEach, vi } from "vitest";

vi.mock("../../modules/auth/auth.repository.js", () => {
  return {
    authRepository: {
      validateCsrfToken: vi.fn(),
    },
  };
});
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { describe, it, expect } from "vitest";
import { csrfGuard } from "../csrf.js";
import { authRepository } from "../../modules/auth/auth.repository.js";
import { registerErrorHandler } from "../error-handler.plugin.js";

function buildApp() {
  const app = Fastify({ logger: false });

  app.register(cookie);
  registerErrorHandler(app);

  app.post(
    "/protected",
    { preHandler: csrfGuard },
    async () => ({ ok: true })
  );

  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});



describe("CSRF Plugin", () => {
  it("returns 403 if CSRF header is missing", async () => {
  const app = buildApp();

  const res = await app.inject({
    method: "POST",
    url: "/protected",
    headers: {
      cookie: "refreshToken=rt",
    },
  });

  expect(res.statusCode).toBe(403);
  expect(JSON.parse(res.body)).toEqual({
    error: "CSRF_REQUIRED",
  });
});

it("returns 403 if refresh cookie is missing", async () => {
  const app = buildApp();

  const res = await app.inject({
    method: "POST",
    url: "/protected",
    headers: {
      "x-csrf-token": "csrf",
    },
  });

  expect(res.statusCode).toBe(403);
  expect(JSON.parse(res.body)).toEqual({
    error: "NO_REFRESH_TOKEN",
  });
});

it("returns 403 if CSRF token is invalid", async () => {
  vi.spyOn(authRepository, "validateCsrfToken").mockResolvedValue(false);

  const app = buildApp();

  const res = await app.inject({
    method: "POST",
    url: "/protected",
    headers: {
      "x-csrf-token": "bad",
      cookie: "refreshToken=rt",
    },
  });

  expect(res.statusCode).toBe(403);
  expect(JSON.parse(res.body)).toEqual({
    error: "INVALID_CSRF_TOKEN",
  });
});

it("allows request if CSRF token is valid", async () => {
  vi.spyOn(authRepository, "validateCsrfToken").mockResolvedValue(true);

  const app = buildApp();

  const res = await app.inject({
    method: "POST",
    url: "/protected",
    headers: {
      "x-csrf-token": "good",
      cookie: "refreshToken=rt",
    },
  });

  expect(res.statusCode).toBe(200);
  expect(JSON.parse(res.body)).toEqual({
    ok: true,
  });
});

});
