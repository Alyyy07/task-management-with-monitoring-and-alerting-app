import { FastifyReply, FastifyRequest } from "fastify";
import { TaskService } from "./tasks.service.js";
import { TaskStatus } from "./tasks.types.js";

export function buildTaskController(service: TaskService) {
  return {
    async list(req:FastifyRequest, reply:FastifyReply) {
      const { projectId } = req.params as { projectId: string };
      const tasks = await service.listByProject(
        req.user,
        projectId
      );
      reply.send(tasks);
    },

    async create(req:FastifyRequest, reply:FastifyReply) {
      const body = req.body as { title: string; description: string; projectId: string };
      const task = await service.create(req.user, body);
      reply.status(201).send(task);
    },

    async update(req:FastifyRequest, reply:FastifyReply) {
      const body = req.body as { title?: string; description?: string; status?: TaskStatus };
      const { taskId } = req.params as { taskId: string };
      const task = await service.update(
        req.user,
        taskId,
        body
      );
      reply.send(task);
    },

    async delete(req:FastifyRequest, reply:FastifyReply) {
      const { taskId } = req.params as { taskId: string };
      await service.delete(req.user, taskId);
      reply.status(204).send();
    },

    async assign(req:FastifyRequest, reply:FastifyReply) {
      const { taskId } = req.params as { taskId: string };
      const { assigneeId } = req.body as { assigneeId: string };
      const task = await service.assign(
        req.user,
        taskId,
        assigneeId
      );
      reply.send(task);
    },
  };
}
