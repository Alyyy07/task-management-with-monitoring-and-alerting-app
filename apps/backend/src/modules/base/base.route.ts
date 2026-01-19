import { FastifyInstance } from "fastify";
import { prisma } from "../../libs/prisma.js";

export async function baseRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    return { hello: "halo" };
  });
}
