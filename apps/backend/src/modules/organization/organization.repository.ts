import { prisma } from "../../libs/prisma.js";
import { Membership } from "./organization.type.js";

export const organizationRepository = {
  findById(id: string) {
    return prisma.organization.findUnique({ where: { id } });
  },

  create(data: { name: string }) {
    return prisma.organization.create({ data });
  },

  update(id: string, data: { name?: string }) {
    return prisma.organization.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.organization.delete({ where: { id } });
  },

  async getMembership(
    userId: string,
    organizationId: string
  ): Promise<Membership> {
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

  addMember(userId: string, organizationId: string, role: "ADMIN" | "MEMBER") {
    return prisma.membership.create({
      data: { userId, organizationId, role },
    });
  },

  removeMember(userId: string, organizationId: string) {
    return prisma.membership.delete({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });
  },

  updateMemberRole(
    userId: string,
    organizationId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    return prisma.membership.update({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      data: { role },
    });
  },
};
