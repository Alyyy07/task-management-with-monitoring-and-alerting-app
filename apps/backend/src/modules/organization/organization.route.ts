import { FastifyInstance } from "fastify";
import { OrganizationService } from "./organization.service.js";
import { organizationRepository } from "./organization.repository.js";
import { buildOrganizationController } from "./organization.controller.js";

type OrganizationRoutesOptions = {
  organizationService: OrganizationService;
};
export async function organizationRoutes(app: FastifyInstance,opts:OrganizationRoutesOptions) {
  const organizationService = opts.organizationService || new OrganizationService(organizationRepository);
  const controller = buildOrganizationController(organizationService);

  app.get(
    "/:id",
    { preHandler: app.authenticate },
    controller.getOrganization
  );
}
