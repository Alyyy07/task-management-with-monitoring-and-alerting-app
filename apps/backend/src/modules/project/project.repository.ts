import { prisma } from "../../libs/prisma.js";
import { ProjectRepository } from "./project.types.js";

export const projectRepository: ProjectRepository = {
  async getProjectWithOrg(projectId: string) {
    return prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        organizationId: true,
      },
    });
  },
};
