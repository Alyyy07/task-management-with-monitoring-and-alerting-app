import { FastifyRequest, FastifyReply } from "fastify";
import { authRepository } from "../modules/auth/auth.repository.js";

export async function csrfGuard(req: FastifyRequest, reply: FastifyReply) {
  const csrfToken = req.headers["x-csrf-token"];

  if (!csrfToken || typeof csrfToken !== "string") {
    return reply.status(403).send({ error: "CSRF_REQUIRED" });
  }

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return reply.status(403).send({ error: "CSRF_REQUIRED" });
  }

  const valid = await authRepository.validateCsrfToken(refreshToken, csrfToken);

  if (!valid) {
    return reply.status(403).send({ error: "INVALID_CSRF_TOKEN" });
  }
}
