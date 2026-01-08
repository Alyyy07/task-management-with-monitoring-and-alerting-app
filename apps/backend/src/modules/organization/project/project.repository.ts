// project/project.repository.ts
import { prisma } from "../../../libs/prisma.js";

export const projectRepository = {
  async create(data: {
    name: string;
    organizationId: string;
    createdById: string;
  }) {
    return prisma.project.create({ data });
  },

  async findById(id: string) {
    return prisma.project.findUnique({ where: { id } });
  },

  async findByOrganization(organizationId: string) {
    return prisma.project.findMany({ where: { organizationId } });
  },

  async update(id: string, data: { name?: string }) {
    return prisma.project.update({ where: { id }, data });
  },

  async delete(id: string) {
    await prisma.project.delete({ where: { id } });
  },

  async isCreator(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { createdBy: true },
    });

    if (!project) return "NOT_FOUND";
    if (project.createdBy !== userId) return "NOT_CREATOR";
    return "CREATOR";
  },
};
