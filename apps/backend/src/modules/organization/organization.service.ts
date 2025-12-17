import { prisma } from "../../libs/prisma.js";

export async function createOrganization(userId: string, name: string) {
  return prisma.organization.create({
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
