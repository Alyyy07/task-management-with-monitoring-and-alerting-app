import { requireActiveMembership } from "../auth/authz.membership.js";
import { AuthzError, AuthzErrorCode } from "../authz/authz.errors.js";
import { requireOrgMember, requireTaskOwner } from "../authz/authz.guard.js";
import { AuthContext } from "../authz/authz.type.js";
import { OrganizationRepository } from "../organization/organization.type.js";
import {
  canAssignTask,
  canCreateTask,
  canDeleteTask,
  canUpdateTask,
  requirePolicy,
} from "./tasks.policies.js";
import { TaskRepository } from "./tasks.types.js";

export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async listTasks(context: AuthContext, organizationId: string) {
    await requireOrgMember(
      context,
      organizationId,
      this.organizationRepository.isMember.bind(this.organizationRepository)
    );

    return this.taskRepository.findByOrganization(organizationId);
  }

  async createTask(
    context: AuthContext,
    data: {
      title: string;
      projectId: string;
      description?: string;
      organizationId: string;
    }
  ) {
    const membership = await this.organizationRepository.getMembership(
      context.userId,
      data.organizationId
    );

    if (membership.status !== "MEMBER") {
      throw new AuthzError(AuthzErrorCode.NOT_MEMBER);
    }

    requirePolicy(
      canCreateTask({
        actorId: context.userId,
        role: membership.role,
      }),
      AuthzErrorCode.INSUFFICIENT_ROLE
    );

    return this.taskRepository.create({
      ...data,
      createdBy: context.userId,
    });
  }

  async updateTask(
    context: AuthContext,
    taskId: string,
    data: { title?: string; description?: string }
  ) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AuthzError(AuthzErrorCode.NOT_FOUND);
    }

    const membership = await this.organizationRepository.getMembership(
      context.userId,
      task.organizationId
    );

    const { role } = requireActiveMembership(membership);

    requirePolicy(
      canUpdateTask(
        {
          actorId: context.userId,
          role,
        },
        { ownerId: task.createdBy }
      ),
      AuthzErrorCode.NOT_ALLOWED
    );

    return this.taskRepository.update(taskId, data);
  }

  async deleteTask(context: AuthContext, taskId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AuthzError(AuthzErrorCode.NOT_FOUND);
    }

    const membership = await this.organizationRepository.getMembership(
      context.userId,
      task.organizationId
    );
    const { role } = requireActiveMembership(membership);
    requirePolicy(
      canDeleteTask({
        actorId: context.userId,
        role,
      }),
      AuthzErrorCode.NOT_ALLOWED
    );

    await this.taskRepository.delete(taskId);
  }

  async assignTask(
    context: AuthContext,
    input: {
      taskId: string;
      organizationId: string;
      assigneeId: string;
    }
  ) {
    const membership = await this.organizationRepository.getMembership(
      context.userId,
      input.organizationId
    );
    const { role } = requireActiveMembership(membership);
    requirePolicy(
      canAssignTask({
        actorId: context.userId,
        role,
      }),
      AuthzErrorCode.INSUFFICIENT_ROLE
    );

    await requireOrgMember(
      context,
      input.organizationId,
      this.organizationRepository.isMember.bind(this.organizationRepository)
    );

    return this.taskRepository.assignTask(input.taskId, input.assigneeId);
  }
}
