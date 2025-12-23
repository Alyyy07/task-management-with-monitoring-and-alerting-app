import { FastifyRequest, FastifyReply } from "fastify";
import { authRepository } from "../modules/auth/auth.repository.js";

export async function csrfGuard(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.headers["x-csrf-token"];
  if (!token || typeof token !== "string") {
    return reply.status(403).send({ message: "CSRF token missing" });
  }
  
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthenticated" });
  }
  
  const valid = await authRepository.validateCsrfToken(userId, token);
  if (!valid) {
    return reply.status(403).send({ message: "Invalid CSRF token" });
  }
}
