import fastify from "fastify";
import { describe, it, expect, vi } from "vitest";
import { authenticate } from "../authenticate.js";
import { AuthError } from "../../modules/auth/auth.errors.js";

function buildApp(jwtVerifyMock: any) {
  const app = fastify();

  app.decorate("jwt", {
    verify: jwtVerifyMock,
  } as any);

  app.register(authenticate);

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof AuthError) {
      return reply.status(401).send({ code: err.code });
    }
    reply.status(500).send();
  });

  app.get("/protected", async (req, reply) => {
    await app.authenticate(req, reply);
    return { ok: true };
  });

  return app;
}

describe("authenticate plugin", () => {
  it("returns 401 if no authorization header", async () => {
    const app = buildApp(vi.fn());

    const res = await app.inject({
      method: "GET",
      url: "/protected",
    });

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 if authorization format invalid", async () => {
    const app = buildApp(vi.fn());

    const res = await app.inject({
      method: "GET",
      url: "/protected",
      headers: {
        authorization: "invalid",
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 if token invalid", async () => {
    const verifyMock = vi.fn(() => {
      throw new Error("jwt invalid");
    });

    const app = buildApp(verifyMock);

    const res = await app.inject({
      method: "GET",
      url: "/protected",
      headers: {
        authorization: "Bearer bad-token",
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it("allows request if token valid", async () => {
    const verifyMock = vi.fn().mockReturnValue({
      userId: "user-1",
    });

    const app = buildApp(verifyMock);

    const res = await app.inject({
      method: "GET",
      url: "/protected",
      headers: {
        authorization: "Bearer good-token",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
  });
});
