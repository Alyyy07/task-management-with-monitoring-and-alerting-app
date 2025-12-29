import { prisma } from "../../libs/prisma.js";
import { TaskRepository } from "./tasks.types.js";

export const taskRepository: TaskRepository = {
  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  },

  async findByOrganization(orgId: string) {
    return prisma.task.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  },

  async isOwner(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        ownerId: userId,
      },
    });

    return Boolean(task);
  },

  async create(data) {
    return prisma.task.create({
      data,
    });
  },

  async update(id: string, data) {
    return prisma.task.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    await prisma.task.delete({
      where: { id },
    });
  },
};
