import { FastifyInstance } from "fastify";
import { TaskService } from "./tasks.service.js";

import { buildTaskController } from "./tasks.controller.js";
import { taskRepository } from "./tasks.repository.js";
import { organizationRepository } from "../organization/organization.repository.js";
import { CreateTaskSchema, UpdateTaskSchema } from "./tasks.schema.js";
type TaskRoutesOptions = {
  taskService: TaskService;
};
export async function taskRoutes(
  app: FastifyInstance,
  opts: TaskRoutesOptions
) {
  const taskService =
    opts.taskService || new TaskService(taskRepository, organizationRepository);
  const controller = buildTaskController(taskService);
  app.get(
    "/:orgId/tasks",
    { preHandler: app.authenticate },
    controller.listTasks
  );
  app.post(
    "/",
    { preHandler: app.authenticate, schema: { body: CreateTaskSchema } },
    controller.createTask
  );
  app.put(
    "/:taskId",
    { preHandler: app.authenticate, schema: { body: UpdateTaskSchema } },
    controller.updateTask
  );
  app.delete(
    "/:taskId",
    { preHandler: app.authenticate },
    controller.deleteTask
  );
}
