import { FastifyRequest, FastifyReply } from "fastify";
import { TokenService } from "./auth.types.js";

export function buildAuthMiddleware(tokenService: TokenService) {
  return async function authMiddleware(
    req: FastifyRequest,
    reply: FastifyReply
  ) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "UNAUTHORIZED" });
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const payload = tokenService.verifyAccessToken(token);
      req.user = { userId: payload.userId };
    } catch {
      return reply.status(401).send({ error: "UNAUTHORIZED" });
    }
  };
}
