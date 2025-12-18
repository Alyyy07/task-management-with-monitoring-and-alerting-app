import { prisma } from "../../libs/prisma.js";
import { createAuditLog } from "../audit/audit.service.js";

export async function createOrganization(userId: string, name: string) {
  const org = await prisma.organization.create({
    data: {
      name,
      memberships: {
        create: {
          userId,
          role: "OWNER"
        }
      }
    }
  });

  await createAuditLog({
    userId,
    action:"CREATE_ORGANIZATION",
    organizationId: org.id
  });

  return org;
}

export async function listOrganizations(userId: string) {
  return prisma.organization.findMany({
    where: {
      memberships: {
        some: { userId }
      }
    }
  });
}
