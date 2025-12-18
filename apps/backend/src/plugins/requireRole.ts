import { FastifyRequest, FastifyReply } from "fastify";
import { authorizeOrganizationAction } from "../modules/membership/authorization.service.js";
import { Role } from "../modules/membership/role.js";

export function requireRole(requiredRole: Role) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { orgId } = request.params as { orgId: string };

    try {
      await authorizeOrganizationAction(
        request.user.userId,
        orgId,
        requiredRole
      );
    } catch (err: any) {
      return reply.status(403).send({
        message: err.message ?? "Forbidden"
      });
    }
  };
}
