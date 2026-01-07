import { FastifyReply, FastifyRequest } from "fastify";
import { OrganizationService } from "./organization.service.js";

export function buildOrganizationController(service: OrganizationService) {
  return {
    async list(req:FastifyRequest, reply:FastifyReply) {
      const orgs = await service.listOrg(req.user);
      reply.status(200).send(orgs);
    },
    async create(req:FastifyRequest, reply:FastifyReply) {
      const { name } = req.body as { name: string };
      const org = await service.create(req.user, name);
      reply.status(201).send(org);
    },

    async get(req:FastifyRequest, reply:FastifyReply) {
      const params = req.params as { orgId: string };
      const org = await service.get(req.user, params.orgId);
      reply.send(org);
    },

    async update(req:FastifyRequest, reply:FastifyReply) {
      const { orgId } = req.params as { orgId: string };
      const body = req.body as { name?: string };
      const org = await service.update(
        req.user,
        orgId,
        body
      );
      reply.send(org);
    },

    async delete(req:FastifyRequest, reply:FastifyReply) {
      const { orgId } = req.params as { orgId: string };
      await service.delete(req.user, orgId);
      reply.status(204).send();
    },

    async listMembers(req:FastifyRequest, reply:FastifyReply) {
      const { orgId } = req.params as { orgId: string };
      const members = await service.listMembers(req.user, orgId);
      reply.status(200).send(members);
    },

    async addMember(req:FastifyRequest, reply:FastifyReply) {
      const { orgId } = req.params as { orgId: string };
      const { userId, role } = req.body as { userId: string; role: "ADMIN" | "MEMBER" };
      await service.addMember(
        req.user,
        orgId,
        userId,
        role
      );
      reply.status(204).send();
    },

    async changeMemberRole(req:FastifyRequest, reply:FastifyReply) {
      const { orgId, userId } = req.params as { orgId: string; userId: string };
      const { role } = req.body as { role: "ADMIN" | "MEMBER" };
      await service.updateMemberRole(
        req.user,
        orgId,
        userId,
        role
      );
      reply.status(204).send();
    },

    async removeMember(req:FastifyRequest, reply:FastifyReply) {
      const { orgId, userId } = req.params as { orgId: string; userId: string };
      await service.removeMember(req.user, orgId, userId);
      reply.status(204).send();
    }
  };
}
