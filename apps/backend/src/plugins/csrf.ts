import { FastifyRequest, FastifyReply } from "fastify";
import { authRepository } from "../modules/auth/auth.repository.js";
import { AuthError, AuthErrorCode } from "../modules/auth/auth.errors.js";

export async function csrfGuard(req: FastifyRequest, reply: FastifyReply) {
  const csrfToken = req.headers["x-csrf-token"];

  if (!csrfToken || typeof csrfToken !== "string") {
    throw new AuthError(AuthErrorCode.CSRF_REQUIRED);
  }

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AuthError(AuthErrorCode.NO_REFRESH_TOKEN);
  }

  const valid = await authRepository.validateCsrfToken(refreshToken, csrfToken);

  if (!valid) {
    throw new AuthError(AuthErrorCode.INVALID_CSRF_TOKEN);
  }
}
