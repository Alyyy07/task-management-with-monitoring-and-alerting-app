import { AuthzErrorCode } from "../authz/authz.errors.js";
import { AuthContext } from "../authz/authz.type.js";
import { enforce } from "../authz/enforce.js";
import { OrganizationRepository } from "../organization/organization.type.js";
import { ProjectRepository } from "../organization/project/project.types.js";
import { TaskRepository } from "../tasks/tasks.types.js";
import { taskPolicy } from "./tasks.policies.js";

export class TaskAuthz {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly taskRepo: TaskRepository
  ) {}

  async policyForTask(context: AuthContext, taskId: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new Error("TASK_NOT_FOUND");

    const project = await this.projectRepo.findById(task.projectId);
    if (!project) throw new Error("PROJECT_NOT_FOUND");

    const membership = await this.orgRepo.getMembership(
      context.userId,
      project.organizationId
    );

    if (!membership) {
      throw new Error("NOT_MEMBER");
    }

    const policy = taskPolicy(context, membership, {
      isCreator: await this.taskRepo.isCreator(taskId, context.userId),
      isAssignee: await this.taskRepo.isAssignee(taskId, context.userId),
      isProjectCreator: project.createdBy === context.userId,
    });

    return policy;
  }

  async requireRead(context: AuthContext, taskId: string) {
    const policy = await this.policyForTask(context, taskId);
    enforce(policy.canRead(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  async requireUpdate(context: AuthContext, taskId: string) {
    const policy = await this.policyForTask(context, taskId);
    enforce(policy.canUpdate(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  async requireDelete(context: AuthContext, taskId: string) {
    const policy = await this.policyForTask(context, taskId);
    enforce(policy.canDelete(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  async requireAssign(context: AuthContext, taskId: string) {
    const policy = await this.policyForTask(context, taskId);
    enforce(policy.canAssign(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }
}
