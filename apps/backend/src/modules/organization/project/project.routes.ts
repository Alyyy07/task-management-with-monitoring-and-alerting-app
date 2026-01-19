import { FastifyInstance } from "fastify";
import { ProjectService } from "./project.service.js";
import { ProjectAuthz } from "./project.authz.js";
import { organizationRepository } from "../organization.repository.js";
import { projectRepository } from "./project.repository.js";
import { buildProjectController } from "./project.controller.js";
import { csrfGuard } from "../../../plugins/csrf.js";
import { OrganizationAuthz } from "../organization.authz.js";
import { taskRelationalRoutes } from "../../tasks/tasks.routes.js";
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  listProjectsSchema,
  getProjectBySlugSchema,
  getProjectSchema,
  deleteProjectSchema,
  listProjectMembersSchema,
  removeProjectMemberSchema,
  updateProjectMemberRoleSchema,
} from "./project.schema.js";

type ProjectRoutesOptions = {
  projectService?: ProjectService;
};

export async function projectRelationalRoutes(
  app: FastifyInstance,
  opts: ProjectRoutesOptions,
) {
  const orgAuthz = new OrganizationAuthz(organizationRepository);
  const projectAuhz = new ProjectAuthz(projectRepository, orgAuthz);
  const projectService =
    opts.projectService || new ProjectService(projectRepository, projectAuhz);
  const controller = buildProjectController(projectService);

  app.get("/", { schema: listProjectsSchema }, controller.list);
  app.post("/", { schema: createProjectSchema }, controller.create);
  app.get(
    "/slug/:slug",
    { schema: getProjectBySlugSchema },
    controller.getBySlug,
  );
}

export async function projectDirectRoutes(
  app: FastifyInstance,
  opts: ProjectRoutesOptions,
) {
  const orgAuthz = new OrganizationAuthz(organizationRepository);
  const projectAuhz = new ProjectAuthz(projectRepository, orgAuthz);
  const projectService =
    opts.projectService || new ProjectService(projectRepository, projectAuhz);
  const controller = buildProjectController(projectService);

  app.addHook("preHandler", app.authenticate);
  app.addHook("preHandler", csrfGuard);

  app.get("/:projectId", { schema: getProjectSchema }, controller.get);
  app.put("/:projectId", { schema: updateProjectSchema }, controller.update);
  app.delete("/:projectId", { schema: deleteProjectSchema }, controller.delete);

  // Project Members
  app.get(
    "/:projectId/members",
    { schema: listProjectMembersSchema },
    controller.listMembers,
  );
  app.post(
    "/:projectId/members",
    { schema: addProjectMemberSchema },
    controller.addMember,
  );
  app.put(
    "/:projectId/members/:userId",
    { schema: updateProjectMemberRoleSchema },
    controller.changeMemberRole,
  );
  app.delete(
    "/:projectId/members/:userId",
    { schema: removeProjectMemberSchema },
    controller.removeMember,
  );

  // Task Relational Routes
  app.register(taskRelationalRoutes, { prefix: "/:projectId/tasks" });
}

// Deprecated
export const projectRoutes = projectDirectRoutes;
