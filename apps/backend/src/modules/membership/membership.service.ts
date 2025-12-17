import { prisma } from "../../libs/prisma.js";

export async function addMember(
  organizationId: string,
  userId: string,
  role: "ADMIN" | "MEMBER"
) {
  return prisma.membership.create({
    data: {
      organizationId,
      userId,
      role
    }
  });
}
