import { FastifyInstance, FastifyReply } from "fastify";
import { AuthError, AuthErrorStatus } from "../modules/auth/auth.errors.js";
import { AuthzError, AuthzErrorStatus } from "../libs/authz/authz.errors.js";
import {
  DbError,
  DbErrorStatus,
  isPrismaError,
  mapPrismaError,
} from "../libs/db.errors.js";
import {
  ValidationError,
  ValidationErrorStatus,
} from "../libs/validation.errors.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: unknown, _req, reply: FastifyReply) => {
    if (error instanceof AuthError) {
      return handleAuthError(error, reply);
    }

    if (typeof error === "object" && error !== null && "validation" in error) {
      const details = (error as any).validation;
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: details.map((d: any) => ({ message: d.message })),
      });
    }

    if (error instanceof AuthzError) {
      return handleAuthzError(error, reply);
    }

    if (error instanceof DbError) {
      return handleDbError(error, reply);
    }
    if (error instanceof ValidationError) {
      return handleValidationError(error, reply);
    }

    // Handle rate limit errors (429 from @fastify/rate-limit)
    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      (error as any).statusCode === 429
    ) {
      return reply.status(429).send({
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later",
        retryAfter: reply.getHeader("retry-after"),
      });
    }

    // Handle Prisma errors
    if (isPrismaError(error)) {
      try {
        const dbError = mapPrismaError(error);
        return handleDbError(dbError, reply);
      } catch (unmappedError) {
        // If Prisma error can't be mapped, fall through to generic error
        app.log.error(unmappedError as Error | string);
        return reply.status(500).send({
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }

    app.log.error(error as Error | string);
    reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
    });
  });
}

function handleAuthError(error: AuthError, reply: FastifyReply) {
  return reply
    .status(AuthErrorStatus[error.code])
    .send({ error: error.code, message: error.message });
}

function handleAuthzError(error: AuthzError, reply: FastifyReply) {
  return reply
    .status(AuthzErrorStatus[error.code])
    .send({ error: error.code, message: error.message });
}

function handleDbError(error: DbError, reply: FastifyReply) {
  const response: any = { error: error.code };

  if (error.field) {
    response.field = error.field;
  }

  if (error.details) {
    response.message = error.details;
  }

  return reply.status(DbErrorStatus[error.code]).send(response);
}

function handleValidationError(error: ValidationError, reply: FastifyReply) {
  const response: any = { error: error.code, message: error.message };

  if (error.field) {
    response.field = error.field;
  }

  return reply.status(ValidationErrorStatus[error.code]).send(response);
}
