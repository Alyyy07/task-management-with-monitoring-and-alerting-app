import { FastifyInstance } from "fastify";
import { OrganizationService } from "./organization.service.js";
import { organizationRepository } from "./organization.repository.js";
import { buildOrganizationController } from "./organization.controller.js";
import { OrganizationAuthz } from "./organization.authz.js";
import { csrfGuard } from "../../plugins/csrf.js";

type OrganizationRoutesOptions = {
  organizationService?: OrganizationService;
};
export async function organizationRoutes(
  app: FastifyInstance,
  opts: OrganizationRoutesOptions
) {
  const orgAuthz = new OrganizationAuthz(organizationRepository);
  const organizationService =
    opts.organizationService ||
    new OrganizationService(organizationRepository, orgAuthz);
  const controller = buildOrganizationController(organizationService);

  app.addHook("preHandler", app.authenticate);
  app.addHook("preHandler", csrfGuard);

  app.get("/", controller.list);
  app.post("/", controller.create);
  app.get("/:orgId", controller.get);
  app.put("/:orgId", controller.update);
  app.delete("/:orgId", controller.delete);

  app.get("/:orgId/members", controller.listMembers);
  app.post("/:orgId/members", controller.addMember);
  app.put("/:orgId/members/:userId", controller.changeMemberRole);
  app.delete("/:orgId/members/:userId", controller.removeMember);
}
