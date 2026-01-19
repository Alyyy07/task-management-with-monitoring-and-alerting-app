import { prisma } from "../../libs/prisma.js";
import {
  Membership,
  Organization,
  OrganizationRepository,
} from "./organization.type.js";

export const organizationRepository: OrganizationRepository = {
  findById(id: string) {
    return prisma.organization.findUnique({
      where: { id, deletedAt: null },
    });
  },

  findBySlug(slug: string) {
    return prisma.organization.findUnique({
      where: { slug, deletedAt: null },
    });
  },

  create(data: {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    createdById: string;
  }) {
    return prisma.organization.create({ data });
  },

  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      logoUrl?: string;
    },
  ) {
    return prisma.organization.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  listAllOrg(): Promise<Organization[]> {
    return prisma.organization.findMany({ where: { deletedAt: null } });
  },

  listOrgByUser(userId: string): Promise<Organization[]> {
    return prisma.organization.findMany({
      where: {
        memberships: { some: { userId } },
        deletedAt: null,
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
    role: "ADMIN" | "MEMBER",
  ) {
    return prisma.membership.update({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      data: { role },
    });
  },
  async createActivity(data: {
    taskId?: string;
    userId: string;
    action: string;
    projectId?: string;
    organizationId?: string;
    metadata?: any;
    entityId: string;
    entityType: string;
  }) {
    return prisma.activityLog.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        action: data.action,
        projectId: data.projectId,
        organizationId: data.organizationId,
        metadata: data.metadata,
        entityId: data.entityId,
        entityType: data.entityType,
      },
    });
  },
  async countProjects(orgId: string) {
    return prisma.project.count({ where: { organizationId: orgId } });
  },
  async removeUserFromOrgProjects(userId: string, orgId: string) {
    await prisma.projectMembership.deleteMany({
      where: {
        userId,
        project: {
          organizationId: orgId,
        },
      },
    });
  },
};
