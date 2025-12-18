import { FastifyInstance, FastifyRequest } from "fastify";
import { addMember } from "./membership.service.js";
import { requireRole } from "../../plugins/requireRole.js";

export async function membershipRoutes(app: FastifyInstance) {
  app.post(
    "/:orgId/members",
    { preHandler: [app.authenticate, requireRole("ADMIN")] },
    async (request) => {
      const { orgId } = request.params as { orgId: string };
      const { userId, role } = request.body as {
        userId: string;
        role: "ADMIN" | "MEMBER";
      };

      return addMember(orgId, userId, role);
    }
  );
}
