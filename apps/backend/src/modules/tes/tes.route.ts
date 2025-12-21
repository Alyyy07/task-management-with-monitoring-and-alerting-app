import { FastifyInstance } from "fastify";
import { prisma } from "../../libs/prisma.js";

export async function testRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    throw new Error("Test error");
    return { hello: "halo" };
  });

  app.get("/db-test", async (request, reply) => {
    const users = await prisma.user.findMany();
    return { users };
  });
}
