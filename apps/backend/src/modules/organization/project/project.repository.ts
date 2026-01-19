import { prisma } from "../../../libs/prisma.js";
import { ProjectRepository } from "./project.types.js";

export const projectRepository: ProjectRepository = {
  create(data: {
    name: string;
    slug: string;
    description?: string;
    organizationId: string;
    createdById: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.project.create({ data });
  },

  findById(id: string) {
    return prisma.project.findUnique({ where: { id, deletedAt: null } });
  },

  findBySlug(organizationId: string, slug: string) {
    return prisma.project.findUnique({
      where: {
        organizationId_slug: { organizationId, slug },
        deletedAt: null,
      },
    });
  },

  findByOrganization(organizationId: string) {
    return prisma.project.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      status?: any;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return prisma.project.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async userExists(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return !!user;
  },

  getOrgMembership(userId: string, organizationId: string) {
    return prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
  },

  findMembership(userId: string, projectId: string) {
    return prisma.projectMembership.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
      select: { role: true },
    });
  },

  async listMembers(projectId: string) {
    return prisma.projectMembership.findMany({
      where: { projectId },
      orderBy: { role: "asc" },
    });
  },

  async addMember(userId: string, projectId: string, role: "ADMIN" | "MEMBER") {
    return prisma.projectMembership.create({
      data: { userId, projectId, role },
    });
  },

  async removeMember(userId: string, projectId: string) {
    return prisma.projectMembership.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  },

  async changeMemberRole(
    userId: string,
    projectId: string,
    role: "ADMIN" | "MEMBER",
  ) {
    return prisma.projectMembership.update({
      where: { projectId_userId: { projectId, userId } },
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
  async countTasks(projectId: string) {
    return prisma.task.count({ where: { projectId, deletedAt: null } });
  },
};
