export enum AuthzErrorCode {
  NOT_OWNER = "NOT_OWNER",
  NOT_MEMBER = "NOT_MEMBER",
  NOT_FOUND = "NOT_FOUND",
}

export const AuthzErrorStatus: Record<AuthzErrorCode, number> = {
  [AuthzErrorCode.NOT_OWNER]: 403,
  [AuthzErrorCode.NOT_MEMBER]: 403,
  [AuthzErrorCode.NOT_FOUND]: 404,
};

export class AuthzError extends Error {
  constructor(public readonly code: AuthzErrorCode) {
    super(code);
  }
}
