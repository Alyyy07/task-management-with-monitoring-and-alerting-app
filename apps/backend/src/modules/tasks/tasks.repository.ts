// tasks/tasks.repository.ts
import { prisma } from "../../libs/prisma.js";

export const taskRepository = {
  findById(id: string) {
    return prisma.task.findUnique({ where: { id, deletedAt: null } });
  },

  findByProject(projectId: string) {
    return prisma.task.findMany({ where: { projectId, deletedAt: null } });
  },

  create(data: {
    title: string;
    description: string;
    projectId: string;
    createdById: string;
    status?: string;
    priority?: string;
    dueDate?: Date;
    position?: number;
  }) {
    return prisma.task.create({ data });
  },

  update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: Date;
      position?: number;
    },
  ) {
    return prisma.task.update({ where: { id }, data });
  },

  async delete(id: string) {
    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async isCreator(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { createdById: true },
    });
    return task?.createdById === userId;
  },

  async isAssignee(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { assigneeId: true },
    });
    return task?.assigneeId === userId;
  },

  assign(taskId: string, assigneeId: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { assigneeId },
    });
  },

  async createActivity(data: {
    taskId: string;
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
};
