export enum AuthzErrorCode {
  NOT_OWNER = "NOT_OWNER",
  NOT_MEMBER = "NOT_MEMBER",
  NOT_FOUND = "NOT_FOUND",
  INSUFFICIENT_ROLE = "INSUFFICIENT_ROLE",
  INVALID_ASSIGNEE = "INVALID_ASSIGNEE",
}

export const AuthzErrorStatus: Record<AuthzErrorCode, number> = {
  [AuthzErrorCode.NOT_OWNER]: 403,
  [AuthzErrorCode.NOT_MEMBER]: 403,
  [AuthzErrorCode.NOT_FOUND]: 404,
  [AuthzErrorCode.INSUFFICIENT_ROLE]: 403,
  [AuthzErrorCode.INVALID_ASSIGNEE]: 400,
};

export class AuthzError extends Error {
  constructor(public readonly code: AuthzErrorCode) {
    super(code);
  }
}
