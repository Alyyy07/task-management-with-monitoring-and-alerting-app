import fp from "fastify-plugin";
import { FastifyReply, FastifyRequest } from "fastify";

export const authenticate = fp(async (app) => {
  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.status(401).send({ message: "Unauthorized" });
      }
    }
  );
});
