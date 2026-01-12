import { prisma } from "../../../libs/prisma.js";
import { ProjectRepository } from "./project.types.js";

export const projectRepository: ProjectRepository = {
  create(data: { name: string; organizationId: string; createdById: string }) {
    return prisma.project.create({ data });
  },

  findById(id: string) {
    return prisma.project.findUnique({ where: { id } });
  },

  findByOrganization(organizationId: string) {
    return prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  },

  update(id: string, data: { name?: string }) {
    return prisma.project.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.project.delete({ where: { id } });
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

  async addMember(
    userId: string,
    projectId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    return prisma.projectMembership.create({
      data: { userId, projectId, role },
    });
  },

  async removeMember(
    userId: string,
    projectId: string
  ) {
    return prisma.projectMembership.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  },

  async changeMemberRole(
    userId: string,
    projectId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    return prisma.projectMembership.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
    });
  },
};
