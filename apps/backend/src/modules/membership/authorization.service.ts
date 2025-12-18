import { prisma } from "../../libs/prisma.js";
import { Role, hasRequiredRole } from "./role.js";

export async function authorizeOrganizationAction(
  userId: string,
  organizationId: string,
  requiredRole: Role
) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId
      }
    }
  });

  if (!membership) {
    throw new Error("Not a member of this organization");
  }

  if (!hasRequiredRole(membership.role, requiredRole)) {
    throw new Error("Insufficient permissions");
  }

  return membership;
}
