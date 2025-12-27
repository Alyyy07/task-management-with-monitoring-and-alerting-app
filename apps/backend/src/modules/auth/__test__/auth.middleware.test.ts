import { describe, it, expect, vi } from "vitest";
import Fastify from "fastify";
import { buildAuthMiddleware } from "../auth.middleware.js";

function buildApp(tokenServiceMock: any) {
  const app = Fastify();

  app.get(
    "/protected",
    { preHandler: buildAuthMiddleware(tokenServiceMock) },
    async (req) => ({ userId: req.user!.userId })
  );

  return app;
}

describe("Auth Middleware", () => {
  it("returns 401 if no authorization header", async () => {
    const app = buildApp({ verifyAccessToken: vi.fn() });

    const res = await app.inject({
      method: "GET",
      url: "/protected",
    });

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 if token is invalid", async () => {
    const tokenServiceMock = {
      verifyAccessToken: vi.fn(() => {
        throw new Error("invalid");
      }),
    };

    const app = buildApp(tokenServiceMock);

    const res = await app.inject({
      method: "GET",
      url: "/protected",
      headers: {
        authorization: "Bearer bad-token",
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it("attaches user to request if token is valid", async () => {
    const tokenServiceMock = {
      verifyAccessToken: vi.fn(() => ({ userId: "user-1" })),
    };

    const app = buildApp(tokenServiceMock);

    const res = await app.inject({
      method: "GET",
      url: "/protected",
      headers: {
        authorization: "Bearer valid-token",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      userId: "user-1",
    });
  });
});
