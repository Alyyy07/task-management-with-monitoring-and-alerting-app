import { FastifyInstance } from "fastify";
import { createOrganization, listOrganizations } from "./organization.service.js";

export async function organizationRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { name } = request.body as { name: string };
      return createOrganization(request.user.userId, name);
    }
  );

  app.get(
    "/",
    { preHandler: [app.authenticate] },
    async (request) => {
      return listOrganizations(request.user.userId);
    }
  );
}
