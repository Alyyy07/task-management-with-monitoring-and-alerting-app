import { FastifyInstance } from "fastify";
import { TaskService } from "./tasks.service.js";

import { buildTaskController } from "./tasks.controller.js";
import { taskRepository } from "./tasks.repository.js";
import { organizationRepository } from "../organization/organization.repository.js";
import { CreateTaskSchema, UpdateTaskSchema } from "./tasks.schema.js";
import { TaskAuthz } from "./task.authz.js";
import { projectRepository } from "../project/project.repository.js";
type TaskRoutesOptions = {
  taskService: TaskService;
};
export async function taskRoutes(
  app: FastifyInstance,
  opts: TaskRoutesOptions
) {
  const taskAuthz = new TaskAuthz(organizationRepository,projectRepository,taskRepository);
  const taskService =
    opts.taskService || new TaskService(taskRepository, taskAuthz);
  const controller = buildTaskController(taskService);
  app.addHook("preHandler", app.authenticate);

  app.get("/projects/:projectId/tasks", controller.list);
  app.post("/tasks", controller.create);
  app.put("/tasks/:taskId", controller.update);
  app.delete("/tasks/:taskId", controller.delete);
  app.post("/tasks/:taskId/assign", controller.assign);
}
