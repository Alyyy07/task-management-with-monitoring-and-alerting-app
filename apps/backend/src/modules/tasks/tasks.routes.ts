import { FastifyInstance } from "fastify";
import { TaskService } from "./tasks.service.js";

import { buildTaskController } from "./tasks.controller.js";
import { taskRepository } from "./tasks.repository.js";
import { organizationRepository } from "../organization/organization.repository.js";
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  listTasksSchema,
  getTaskSchema,
  deleteTaskSchema,
} from "./tasks.schema.js";
import { TaskAuthz } from "./task.authz.js";
import { projectRepository } from "../organization/project/project.repository.js";
import { OrganizationAuthz } from "../organization/organization.authz.js";
type TaskRoutesOptions = {
  taskService?: TaskService;
};
export async function taskRelationalRoutes(
  app: FastifyInstance,
  opts: TaskRoutesOptions,
) {
  const orgAuthz = new OrganizationAuthz(organizationRepository);
  const taskAuthz = new TaskAuthz(orgAuthz, projectRepository, taskRepository);
  const taskService =
    opts.taskService || new TaskService(taskRepository, taskAuthz);
  const controller = buildTaskController(taskService);

  app.get("/", { schema: listTasksSchema }, controller.list);
  app.post("/", { schema: createTaskSchema }, controller.create);
}

export async function taskDirectRoutes(
  app: FastifyInstance,
  opts: TaskRoutesOptions,
) {
  const orgAuthz = new OrganizationAuthz(organizationRepository);
  const taskAuthz = new TaskAuthz(orgAuthz, projectRepository, taskRepository);
  const taskService =
    opts.taskService || new TaskService(taskRepository, taskAuthz);
  const controller = buildTaskController(taskService);

  app.addHook("preHandler", app.authenticate);

  app.get("/:taskId", { schema: getTaskSchema }, controller.get);
  app.put("/:taskId", { schema: updateTaskSchema }, controller.update);
  app.delete("/:taskId", { schema: deleteTaskSchema }, controller.delete);
  app.post("/:taskId/assign", { schema: assignTaskSchema }, controller.assign);
}
export const taskRoutes = taskDirectRoutes;
