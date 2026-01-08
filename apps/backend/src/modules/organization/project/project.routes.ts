import { FastifyInstance } from "fastify";
import { ProjectService } from "./project.service.js";
import { ProjectAuthz } from "./project.authz.js";
import { organizationRepository } from "../organization.repository.js";
import { projectRepository } from "./project.repository.js";
import { buildProjectController } from "./project.controller.js";

type ProjectRoutesOptions = {
  projectService?: ProjectService;
};

export async function projectRoutes(
  app: FastifyInstance,
  opts: ProjectRoutesOptions
) {
  const projectAuhz = new ProjectAuthz(
    organizationRepository,
    projectRepository
  );
  const projectService =
    opts.projectService || new ProjectService(projectRepository, projectAuhz);
  const controller = buildProjectController(projectService);

  app.addHook("preHandler", app.authenticate);

  app.get("/:orgId/projects", controller.list);
  app.post("/:orgId/projects", controller.create);
  app.get("/:orgId/projects/:projectId", controller.get);
  app.put("/:orgId/projects/:projectId", controller.update);
  app.delete("/:orgId/projects/:projectId", controller.delete);
}
