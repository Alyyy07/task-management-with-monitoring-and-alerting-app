import { FastifyInstance } from "fastify";

export async function userRoutes(app: FastifyInstance) {
  app.get("/profile", { preHandler: app.authenticate }, async (request) => {
    return {
      userId: request.user.userId,
    };
  });
}
