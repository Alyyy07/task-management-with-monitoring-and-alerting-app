import { FastifyInstance } from "fastify";
import { OrganizationService } from "./organization.service.js";
import { organizationRepository } from "./organization.repository.js";
import { buildOrganizationController } from "./organization.controller.js";
import { OrganizationAuthz } from "./organization.authz.js";
import { csrfGuard } from "../../plugins/csrf.js";
import { projectRelationalRoutes } from "./project/project.routes.js";
import {
  createOrgSchema,
  updateOrgSchema,
  addMemberSchema,
  listOrgSchema,
  getOrgSchema,
  getOrgBySlugSchema,
  deleteOrgSchema,
  listOrgMembersSchema,
  removeOrgMemberSchema,
  updateOrgMemberRoleSchema,
} from "./organization.schema.js";

type OrganizationRoutesOptions = {
  organizationService?: OrganizationService;
};
export async function organizationRoutes(
  app: FastifyInstance,
  opts: OrganizationRoutesOptions,
) {
  const orgAuthz = new OrganizationAuthz(organizationRepository);
  const organizationService =
    opts.organizationService ||
    new OrganizationService(organizationRepository, orgAuthz);
  const controller = buildOrganizationController(organizationService);

  app.addHook("preHandler", app.authenticate);
  app.addHook("preHandler", csrfGuard);

  app.get("/", { schema: listOrgSchema }, controller.list);
  app.post("/", { schema: createOrgSchema }, controller.create);
  app.get("/slug/:slug", { schema: getOrgBySlugSchema }, controller.getBySlug);
  app.get("/:orgId", { schema: getOrgSchema }, controller.get);
  app.put("/:orgId", { schema: updateOrgSchema }, controller.update);
  app.delete("/:orgId", { schema: deleteOrgSchema }, controller.delete);

  app.get(
    "/:orgId/members",
    { schema: listOrgMembersSchema },
    controller.listMembers,
  );
  app.post(
    "/:orgId/members",
    { schema: addMemberSchema },
    controller.addMember,
  );
  app.put(
    "/:orgId/members/:userId",
    { schema: updateOrgMemberRoleSchema },
    controller.changeMemberRole,
  );
  app.delete(
    "/:orgId/members/:userId",
    { schema: removeOrgMemberSchema },
    controller.removeMember,
  );

  app.register(projectRelationalRoutes, { prefix: "/:orgId/projects" });
}
