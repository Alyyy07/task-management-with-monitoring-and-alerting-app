export enum AuthzErrorCode {
  FORBIDDEN = "FORBIDDEN",
  NOT_OWNER = "NOT_OWNER",
  NOT_MEMBER = "NOT_MEMBER",
}

export class AuthzError extends Error {
  constructor(public readonly code: AuthzErrorCode) {
    super(code);
  }
}
