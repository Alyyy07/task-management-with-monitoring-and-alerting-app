import { FastifyRequest, FastifyReply } from "fastify";
import { AccessTokenPayload } from "../modules/auth/auth.types.ts";

declare module "fastify" {
  interface FastifyInstance {
    authenticate(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void>;
  }
  interface FastifyRequest{
    startTime?: [number, number];
    routerPath?: string;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AccessTokenPayload;
    user: AccessTokenPayload;
  }
}