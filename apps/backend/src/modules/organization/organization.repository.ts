import { prisma } from "../../libs/prisma.js";
import {
  Membership,
  Organization,
  OrganizationRepository,
} from "./organization.type.js";

export const organizationRepository: OrganizationRepository = {
  findById(id: string) {
    return prisma.organization.findUnique({ where: { id } });
  },

  create(data: { name: string; createdById: string }) {
    return prisma.organization.create({ data });
  },

  update(id: string, data: { name?: string }) {
    return prisma.organization.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.organization.delete({ where: { id } });
  },

  listAllOrg(): Promise<Organization[]>{
    return prisma.organization.findMany();
  },

  listOrgByUser(
    userId: string,
  ): Promise<Organization[]> {
    return prisma.organization.findMany({
      where: {
        memberships: { some: { userId } },
      },
    });
  },

  listMembers(orgId: string): Promise<Membership[]> {
    return prisma.membership.findMany({
      where: { organizationId: orgId },
    });
  },

  findMembership(userId: string, organizationId: string) {
    return prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      select: { role: true },
    });
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
