import { FastifyRequest, FastifyReply } from "fastify";
import { AccessTokenPayload, TokenService } from "../modules/auth/auth.types.ts";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest) => Promise<void>;
    tokenService: TokenService;
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