import { AuthzError, AuthzErrorCode } from "../authz/authz.errors.js";

export type TaskPolicyContext = {
  actorId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
};

export type TaskEntity = {
  ownerId: string;
  assigneeId?: string | null;
};

export function canCreateTask(ctx: TaskPolicyContext) {
  return ctx.role !== "MEMBER";
}

export function canUpdateTask(
  ctx: TaskPolicyContext,
  task: TaskEntity
) {
  return ctx.role === "OWNER" || task.ownerId === ctx.actorId;
}

export function canDeleteTask(
  ctx: TaskPolicyContext
) {
  return ctx.role === "OWNER";
}

export function canAssignTask(ctx: TaskPolicyContext) {
  return ctx.role === "OWNER" || ctx.role === "ADMIN";
}

export function requirePolicy(
  allowed: boolean,
  error: AuthzErrorCode
) {
  if (!allowed) {
    throw new AuthzError(error);
  }
}
