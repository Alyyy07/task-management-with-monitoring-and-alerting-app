import { FastifyInstance } from "fastify";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: [app.authenticate]
    },
    async (request) => {
      return {
        userId: request.user.userId
      };
    }
  );
}
