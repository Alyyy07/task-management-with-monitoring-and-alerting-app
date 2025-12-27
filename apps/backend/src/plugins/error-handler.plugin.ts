import { FastifyInstance, FastifyReply } from "fastify";
import { AuthError, AuthErrorCode } from "../modules/auth/auth.errors.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: unknown, _req, reply: FastifyReply) => {
    if (error instanceof AuthError) {
      return handleAuthError(error, reply);
    }

    if (typeof error === "object" && error !== null && "validation" in error) {
      // `validation` comes from AJV/fastify schema validation errors
      const details = (error as any).validation;
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: details.map((d: any) => ({ message: d.message})),
      });
    }
    
    app.log.error(error as Error | string);
    reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
    });
  });
}

function handleAuthError(error: AuthError, reply: FastifyReply) {
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
