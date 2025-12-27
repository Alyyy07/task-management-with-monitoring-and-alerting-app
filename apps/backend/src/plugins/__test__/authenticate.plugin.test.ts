import { vi } from "vitest";

const tokenServiceMock = {
  signAccessToken: vi.fn(),
  verifyAccessToken: vi.fn(),
};

import Fastify from "fastify";
import { describe, it, expect, beforeEach } from "vitest";
import { authenticate } from "../authenticate.js";
import { registerErrorHandler } from "../error-handler.plugin.js";

function buildApp() {
  const app = Fastify({ logger: false });
  (app as any).tokenService = tokenServiceMock;

  app.register(authenticate);
  registerErrorHandler(app);

  app.get(
    "/protected",
    {
      preHandler: async (req) => {
        await app.authenticate(req);
      },
    },
    async (req) => {
      return { user: req.user };
    }
  );

  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Authenticate Plugin", () => {
  it("returns 401 if Authorization header is missing", async () => {
  const app = buildApp();

  const res = await app.inject({
    method: "GET",
    url: "/protected",
  });

  expect(res.statusCode).toBe(401);
  expect(JSON.parse(res.body)).toEqual({
    error: "NO_TOKEN",
  });
});

it("returns 401 if Authorization header is malformed", async () => {
  const app = buildApp();

  const res = await app.inject({
    method: "GET",
    url: "/protected",
    headers: {
      authorization: "Bearer",
    },
  });

  expect(res.statusCode).toBe(401);
  expect(JSON.parse(res.body)).toEqual({
    error: "NO_TOKEN",
  });
});

it("returns 401 if access token is invalid", async () => {
  tokenServiceMock.verifyAccessToken.mockImplementation(() => {
    throw new Error("bad token");
  });

  const app = buildApp();

  const res = await app.inject({
    method: "GET",
    url: "/protected",
    headers: {
      authorization: "Bearer invalid-token",
    },
  });

  expect(res.statusCode).toBe(401);
  expect(JSON.parse(res.body)).toEqual({
    error: "INVALID_ACCESS_TOKEN",
  });
});

it("allows request and sets req.user on valid token", async () => {
  tokenServiceMock.verifyAccessToken.mockReturnValue({
    userId: "user-123",
  });

  const app = buildApp();

  const res = await app.inject({
    method: "GET",
    url: "/protected",
    headers: {
      authorization: "Bearer valid-token",
    },
  });

  expect(res.statusCode).toBe(200);
  expect(JSON.parse(res.body)).toEqual({
    user: { userId: "user-123" },
  });

  expect(tokenServiceMock.verifyAccessToken).toHaveBeenCalledWith(
    "valid-token"
  );
});


});
