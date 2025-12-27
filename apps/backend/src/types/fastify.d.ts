import { FastifyRequest, FastifyReply } from "fastify";
import { AccessTokenPayload } from "../modules/auth/auth.types.ts";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest) => Promise<void>;
  }
  interface FastifyRequest{
    user?:{
      id: string;
    };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AccessTokenPayload;
    user: AccessTokenPayload;
  }
}