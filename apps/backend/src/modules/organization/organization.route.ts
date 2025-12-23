import { FastifyInstance, FastifyRequest } from "fastify";
import {
  createOrganization,
  listOrganizations,
} from "./organization.service.js";
import { createOrgSchema } from "./organization.schema.js";

export async function organizationRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { preHandler: [app.authenticate], schema: createOrgSchema },
    async (request: FastifyRequest) => {
      const { name } = request.body as { name: string };
      return createOrganization(request.user.userId, name);
    }
  );

  app.get("/", { preHandler: [app.authenticate] }, async (request) => {
    return listOrganizations(request.user.userId);
  });
}
