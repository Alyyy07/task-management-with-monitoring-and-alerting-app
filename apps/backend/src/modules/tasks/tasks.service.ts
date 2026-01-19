import { AuthContext } from "../../libs/authz/authz.type.js";
import { TaskAuthz } from "./task.authz.js";
import { TaskRepository, TaskStatus, TaskPriority } from "./tasks.types.js";
import {
  ValidationError,
  ValidationErrorCode,
} from "../../libs/validation.errors.js";

// tasks/tasks.service.ts
export class TaskService {
  constructor(
    private readonly repo: TaskRepository,
    private readonly authz: TaskAuthz,
  ) {}

  async listByProject(context: AuthContext, projectId: string) {
    return this.repo.findByProject(projectId);
  }

  async get(context: AuthContext, taskId: string) {
    await this.authz.requireRead(context, taskId);
    return this.repo.findById(taskId);
  }

  async create(
    context: AuthContext,
    data: {
      title: string;
      description: string;
      projectId: string;
      priority?: TaskPriority;
      dueDate?: string;
      position?: number;
    },
  ) {
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      throw new ValidationError(
        ValidationErrorCode.PAST_DATE,
        "dueDate",
        "Due date cannot be in the past",
      );
    }
    const task = await this.repo.create({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdById: context.userId,
    });

    await this.repo.createActivity({
      taskId: task.id,
      userId: context.userId,
      action: "TASK_CREATED",
      projectId: data.projectId,
      entityId: task.id,
      entityType: "TASK",
      metadata: { title: task.title },
    });

    return task;
  }

  async update(
    context: AuthContext,
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string;
      position?: number;
    },
  ) {
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      throw new ValidationError(
        ValidationErrorCode.PAST_DATE,
        "dueDate",
        "Due date cannot be in the past",
      );
    }
    await this.authz.requireUpdate(context, taskId);
    const task = await this.repo.update(taskId, {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });

    await this.repo.createActivity({
      taskId: task.id,
      userId: context.userId,
      action: "TASK_UPDATED",
      projectId: task.projectId,
      entityId: task.id,
      entityType: "TASK",
      metadata: { changes: data },
    });

    return task;
  }

  async delete(context: AuthContext, taskId: string) {
    await this.authz.requireDelete(context, taskId);
    // Fetch task before delete to get info for log
    const task = await this.repo.findById(taskId);
    if (task) {
      await this.repo.createActivity({
        taskId: taskId,
        userId: context.userId,
        action: "TASK_DELETED",
        projectId: task.projectId,
        entityId: taskId,
        entityType: "TASK",
        metadata: { title: task.title, description: task.description },
      });
    }
    await this.repo.delete(taskId);
  }

  async assign(context: AuthContext, taskId: string, assigneeId: string) {
    await this.authz.requireAssign(context, taskId);
    const task = await this.repo.assign(taskId, assigneeId);

    await this.repo.createActivity({
      taskId: task.id,
      userId: context.userId,
      action: "TASK_ASSIGNED",
      projectId: task.projectId,
      entityId: task.id,
      entityType: "TASK",
      metadata: { assigneeId },
    });

    return task;
  }
}
