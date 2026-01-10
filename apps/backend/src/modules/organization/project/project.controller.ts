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
      const { projectId } = req.params as { projectId: string };
      const project = await service.get(req.user, projectId);
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

    async listMembers(req: FastifyRequest, reply: FastifyReply) {
      const { projectId } = req.params as { projectId: string };
      const members = await service.listMembers(req.user, projectId);
      reply.status(200).send(members);
    },

    async addMember(req: FastifyRequest, reply: FastifyReply) {
      const { orgId, projectId } = req.params as {
        orgId: string;
        projectId: string;
      };
      const { userId, role } = req.body as {
        userId: string;
        role: "ADMIN" | "MEMBER";
      };
      await service.addMember(req.user, orgId, projectId, userId, role);
      reply.status(204).send();
    },

    async removeMember(req: FastifyRequest, reply: FastifyReply) {
      const { orgId, projectId, userId } = req.params as {
        orgId: string;
        projectId: string;
        userId: string;
      };
      await service.removeMember(req.user, orgId, projectId, userId);
      reply.status(204).send();
    },

    async changeMemberRole(req: FastifyRequest, reply: FastifyReply) {
      const { orgId, projectId, userId } = req.params as {
        orgId: string;
        projectId: string;
        userId: string;
      };
      const { role } = req.body as { role: "ADMIN" | "MEMBER" };
      await service.changeMemberRole(req.user, orgId, projectId, userId, role);
      reply.status(204).send();
    },
  };
}
