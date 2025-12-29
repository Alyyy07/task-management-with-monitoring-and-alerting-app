import { FastifyReply, FastifyRequest } from "fastify";
import { OrganizationService } from "./organization.service.js";

export function buildOrganizationController(
  organizationService: OrganizationService
) {
  return {
    async getOrganization(request: FastifyRequest, reply: FastifyReply) {
      const params = request.params as { id: string };
      const organization = await organizationService.getOrganization(
        { userId: request.user.userId },
        params.id
      );
      return reply.status(200).send(organization);
    }
  };
}
