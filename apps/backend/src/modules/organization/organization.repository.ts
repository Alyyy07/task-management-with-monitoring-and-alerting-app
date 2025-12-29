import { prisma } from "../../libs/prisma.js";
import { OrganizationRepository } from "./organization.type.js";

export const organizationRepository: OrganizationRepository = {
  async isMember(userId: string, organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        members: {
          where: { userId },
          select: { userId: true },
        },
      },
    });

    if (!org) return "NOT_FOUND";
    if (org.members.length === 0) return "NOT_MEMBER";

    return "MEMBER";
  },
  async findById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
  },

  async getMembership(userId: string, organizationId: string) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      const orgExists = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { id: true },
      });

      return orgExists ? { status: "NOT_MEMBER" } : { status: "NOT_FOUND" };
    }

    return {
      status: "MEMBER",
      role: membership.role,
    };
  },
};
