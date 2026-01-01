import { FastifyInstance } from "fastify";
import { OrganizationService } from "./organization.service.js";
import { organizationRepository } from "./organization.repository.js";
import { buildOrganizationController } from "./organization.controller.js";
import { OrganizationAuthz } from "./organization.authz.js";

type OrganizationRoutesOptions = {
  organizationService?: OrganizationService;
};
export async function organizationRoutes(app: FastifyInstance,opts:OrganizationRoutesOptions) {
  const orgAuthz = new OrganizationAuthz(organizationRepository);
  const organizationService = opts.organizationService || new OrganizationService(organizationRepository, orgAuthz);
  const controller = buildOrganizationController(organizationService);

  app.addHook("preHandler", app.authenticate);

  app.post("/", controller.create);
  app.get("/:orgId", controller.get);
  app.put("/:orgId", controller.update);
  app.delete("/:orgId", controller.delete);

  app.post("/:orgId/members", controller.addMember);
  app.delete("/:orgId/members/:userId", controller.removeMember);
}
