import { AuthzErrorCode, AuthzError } from "../../libs/authz/authz.errors.js";
import { AuthContext } from "../../libs/authz/authz.type.js";
import { enforce } from "../../libs/authz/enforce.js";
import { OrganizationAuthz } from "../organization/organization.authz.js";
import { ProjectRepository } from "../organization/project/project.types.js";
import { TaskRepository } from "../tasks/tasks.types.js";
import { taskPolicy } from "./tasks.policies.js";

export class TaskAuthz {
  constructor(
    private readonly orgAuthz: OrganizationAuthz,
    private readonly projectRepo: ProjectRepository,
    private readonly taskRepo: TaskRepository
  ) {}

  async policyForTask(context: AuthContext, taskId: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new AuthzError(AuthzErrorCode.NOT_FOUND, "Task not found");

    const project = await this.projectRepo.findById(task.projectId);
    if (!project)
      throw new AuthzError(AuthzErrorCode.NOT_FOUND, "Project not found");

    const membership = await this.orgAuthz.getMembership(
      context.userId,
      project.organizationId
    );

    if (membership.status !== "MEMBER") {
      throw new AuthzError(AuthzErrorCode.NOT_MEMBER);
    }

    const policy = taskPolicy(context, membership, {
      isCreator: await this.taskRepo.isCreator(taskId, context.userId),
      isAssignee: await this.taskRepo.isAssignee(taskId, context.userId),
      isProjectCreator: project.createdById === context.userId,
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
