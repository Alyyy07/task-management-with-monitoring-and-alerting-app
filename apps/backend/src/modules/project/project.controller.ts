import { FastifyReply, FastifyRequest } from "fastify";
import { ProjectService } from "./project.service.js";

export function buildProjectController(service: ProjectService) {
  return {
    async list(req: FastifyRequest, reply: FastifyReply) {
      const { orgId } = req.params as { orgId: string };
      const projects = await service.list(req.user, orgId);
      reply.send(projects);
    },

    async create(req: FastifyRequest, reply: FastifyReply) {
      const body = req.body as { name: string; organizationId: string };
      const project = await service.create(req.user, body);
      reply.status(201).send(project);
    },

    async update(req: FastifyRequest, reply: FastifyReply) {
      const body = req.body as { name?: string };
      const { projectId } = req.params as { projectId: string };
      const project = await service.update(req.user, projectId, body);
      reply.send(project);
    },

    async delete(req: FastifyRequest, reply: FastifyReply) {
      const { projectId } = req.params as { projectId: string };
      await service.delete(req.user, projectId);
      reply.status(204).send();
    },
  };
}
