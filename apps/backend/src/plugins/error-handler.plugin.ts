import { FastifyInstance, FastifyReply } from "fastify";
import { AuthError, AuthErrorCode, AuthErrorStatus } from "../modules/auth/auth.errors.js";
import { AuthzError, AuthzErrorCode, AuthzErrorStatus } from "../modules/authz/authz.errors.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: unknown, _req, reply: FastifyReply) => {
    if (error instanceof AuthError) {
      return handleAuthError(error, reply);
    }

    if (typeof error === "object" && error !== null && "validation" in error) {
      const details = (error as any).validation;
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: details.map((d: any) => ({ message: d.message })),
      });
    }

    if (error instanceof AuthzError) {
      return handleAuthzError(error, reply);
    }

    app.log.error(error as Error | string);
    reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
    });
  });
}

function handleAuthError(error: AuthError, reply: FastifyReply) {
  return reply.status(AuthErrorStatus[error.code]).send({ error: error.code });
}

function handleAuthzError(error: AuthzError, reply: FastifyReply) {
  return reply.status(AuthzErrorStatus[error.code]).send({ error: error.code });
}
