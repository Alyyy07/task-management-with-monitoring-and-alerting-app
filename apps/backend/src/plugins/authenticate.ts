import fp from "fastify-plugin";
import { FastifyPluginAsync, FastifyRequest } from "fastify";
import { AuthError, AuthErrorCode } from "../modules/auth/auth.errors.js";
import { TokenService } from "../modules/auth/auth.types.js";

export const authenticate = (tokenService: TokenService) =>
  fp(async (app) => {
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
        const payload = tokenService.verifyAccessToken(token);
        req.user = { userId: payload.userId };
      } catch {
        throw new AuthError(AuthErrorCode.INVALID_ACCESS_TOKEN);
      }
    });
  });

