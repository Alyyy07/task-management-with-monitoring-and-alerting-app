import fp from "fastify-plugin";
import { FastifyPluginAsync, FastifyRequest } from "fastify";
import { AuthError, AuthErrorCode } from "../modules/auth/auth.errors.js";

export const authenticate: FastifyPluginAsync = fp(async (app) => {
  app.decorate("authenticate", async (req: FastifyRequest) => {
    const auth = req.headers.authorization;

    if (!auth) {
      throw new AuthError(AuthErrorCode.NO_TOKEN);
    }

    const [, token] = auth.split(" ");

    if (!token) {
      throw new AuthError(AuthErrorCode.NO_TOKEN);
    }

    try {
      const payload = app.jwt.verify<{ userId: string }>(token);
      req.user = { userId: payload.userId };
    } catch {
      throw new AuthError(AuthErrorCode.INVALID_ACCESS_TOKEN);
    }
  });
});
