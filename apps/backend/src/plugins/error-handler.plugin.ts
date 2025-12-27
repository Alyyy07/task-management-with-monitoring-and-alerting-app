import { FastifyError, FastifyInstance } from "fastify";
import { AuthError, AuthErrorCode } from "../modules/auth/auth.errors.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof AuthError) {
      return handleAuthError(error, reply);
    }

    app.log.error(error);
    reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
    });
  });
}

function handleAuthError(error: AuthError, reply: any) {
  switch (error.code) {
    case AuthErrorCode.USER_EXISTS:
      return reply.status(409).send({ error: error.code });

    case AuthErrorCode.INVALID_CREDENTIALS:
      return reply.status(401).send({ error: error.code });

    case AuthErrorCode.INVALID_REFRESH_TOKEN:
      return reply.status(401).send({ error: error.code });
    case AuthErrorCode.INVALID_ACCESS_TOKEN:
      return reply.status(401).send({ error: error.code });
    case AuthErrorCode.NO_TOKEN:
      return reply.status(401).send({ error: error.code });
    case AuthErrorCode.CSRF_REQUIRED:
      return reply.status(403).send({ error: error.code });
    case AuthErrorCode.INVALID_CSRF_TOKEN:
      return reply.status(403).send({ error: error.code });

    default:
      return reply.status(400).send({ error: error.code });
  }
}
