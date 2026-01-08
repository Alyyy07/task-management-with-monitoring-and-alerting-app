import { FastifyReply, FastifyRequest } from "fastify";
import { ProjectService } from "./project.service.js";

export function buildProjectController(service: ProjectService) {
  return {
    async list(req: FastifyRequest, reply: FastifyReply) {
      const { orgId } = req.params as { orgId: string };
      const projects = await service.list(req.user, orgId);
      reply.send(projects);
    },

    async get(req: FastifyRequest, reply: FastifyReply) {
      const { projectId, orgId } = req.params as {
        projectId: string;
        orgId: string;
      };
      const project = await service.get(req.user, projectId, orgId);
      reply.send(project);
    },

    async create(req: FastifyRequest, reply: FastifyReply) {
      const body = req.body as { name: string };
      const { orgId } = req.params as { orgId: string };
      const project = await service.create(req.user, body, orgId);
      reply.status(201).send(project);
    },

    async update(req: FastifyRequest, reply: FastifyReply) {
      const body = req.body as { name?: string };
      const { projectId, orgId } = req.params as {
        projectId: string;
        orgId: string;
      };
      const project = await service.update(req.user, projectId, orgId, body);
      reply.send(project);
    },

    async delete(req: FastifyRequest, reply: FastifyReply) {
      const { projectId, orgId } = req.params as {
        projectId: string;
        orgId: string;
      };
      await service.delete(req.user, projectId, orgId);
      reply.status(204).send();
    },
  };
}
