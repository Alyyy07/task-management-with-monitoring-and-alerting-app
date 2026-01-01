// tasks/tasks.repository.ts
import { prisma } from "../../libs/prisma.js";

export const taskRepository = {
  findById(id:string) {
    return prisma.task.findUnique({ where: { id } });
  },

  findByProject(projectId:string) {
    return prisma.task.findMany({ where: { projectId } });
  },

  create(data:{ title: string; description: string; projectId: string; createdById: string }) {
    return prisma.task.create({ data });
  },

  update(id:string, data:{ title?: string; description?: string; status?: string }) {
    return prisma.task.update({ where: { id }, data });
  },

  async delete(id:string) {
    await prisma.task.delete({ where: { id } });
  },

  async isCreator(taskId:string, userId:string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { createdById: true },
    });
    return task?.createdById === userId;
  },

  async isAssignee(taskId:string, userId:string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { assigneeId: true },
    });
    return task?.assigneeId === userId;
  },

  assign(taskId:string, assigneeId:string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { assigneeId },
    });
  },
};
