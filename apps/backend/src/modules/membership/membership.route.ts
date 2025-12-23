import { FastifyInstance, FastifyRequest } from "fastify";
import { addMember } from "./membership.service.js";
import { requireRole } from "../../plugins/requireRole.js";
import { addMemberSchema } from "./membership.schema.js";
import { csrfGuard } from "../../plugins/csrf.js";

export async function membershipRoutes(app: FastifyInstance) {
  app.post(
    "/:orgId/members",
    {
      preHandler: [app.authenticate, csrfGuard, requireRole("ADMIN")],
      schema: addMemberSchema,
    },
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
