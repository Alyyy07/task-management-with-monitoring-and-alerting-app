import { AuthContext } from "../authz/authz.type.js";
import { TaskAuthz } from "./task.authz.js";
import { TaskRepository, TaskStatus } from "./tasks.types.js";

// tasks/tasks.service.ts
export class TaskService {
  constructor(
    private readonly repo: TaskRepository,
    private readonly authz: TaskAuthz
  ) {}

  async listByProject(context: AuthContext, projectId: string) {
    return this.repo.findByProject(projectId);
  }

  async create(context: AuthContext, data:{ title: string; description: string; projectId: string }) {
    return this.repo.create({
      ...data,
      createdById: context.userId,
      status: "TODO",
    });
  }

  async update(context: AuthContext, taskId: string, data:{ title?: string; description?: string; status?: TaskStatus }) {
    await this.authz.requireUpdate(context, taskId);
    return this.repo.update(taskId, data);
  }

  async delete(context: AuthContext, taskId: string) {
    await this.authz.requireDelete(context, taskId);
    await this.repo.delete(taskId);
  }

  async assign(context: AuthContext, taskId: string, assigneeId: string) {
    await this.authz.requireAssign(context, taskId);
    return this.repo.assign(taskId, assigneeId);
  }
}
