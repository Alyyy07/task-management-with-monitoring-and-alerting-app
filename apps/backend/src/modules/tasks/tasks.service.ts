import { requireOrgMember, requireTaskOwner } from "../authz/authz.guard.js";
import { AuthContext } from "../authz/authz.type.js";
import { OrganizationRepository } from "../organization/organization.type.js";
import { TaskRepository } from "./tasks.types.js";


export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async listTasks(
    context: AuthContext,
    organizationId: string
  ) {
    await requireOrgMember(
      context,
      organizationId,
      this.organizationRepository.isMember.bind(this.organizationRepository)
    );

    return this.taskRepository.findByOrganization(organizationId);
  }

    async create(
    context: AuthContext,
    data: { title: string; description?: string; organizationId: string }
  ) {
    await requireOrgMember(
      context,
      data.organizationId,
      this.organizationRepository.isMember.bind(this.organizationRepository)
    );

    return this.taskRepository.create({
      ...data,
      ownerId: context.userId,
    });
  }

  async updateTask(
    context: AuthContext,
    taskId: string,
    data: { title?: string; description?: string }
  ) {
    await requireTaskOwner(
      context,
      taskId,
      this.taskRepository.isOwner.bind(this.taskRepository)
    );

    return this.taskRepository.update(taskId, data);
  }

  async deleteTask(context: AuthContext, taskId: string) {
    await requireTaskOwner(
      context,
      taskId,
      this.taskRepository.isOwner.bind(this.taskRepository)
    );

    await this.taskRepository.delete(taskId);
  }
}
