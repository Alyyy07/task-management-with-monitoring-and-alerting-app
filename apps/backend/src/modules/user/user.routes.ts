import { FastifyInstance, FastifyRequest } from "fastify";

export async function userRoutes(app: FastifyInstance) {
  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", protectedApp.authenticate);

    protectedApp.get("/profile", async (request: FastifyRequest) => {
      return {
        userId: request.user.userId,
      };
    });
  });
}
