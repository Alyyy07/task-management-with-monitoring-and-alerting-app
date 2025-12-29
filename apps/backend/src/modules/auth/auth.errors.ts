export enum AuthErrorCode {
  USER_EXISTS = "USER_EXISTS",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN",
  INVALID_ACCESS_TOKEN = "INVALID_ACCESS_TOKEN",
  UNAUTHORIZED = "UNAUTHORIZED",
  NO_TOKEN = "NO_TOKEN",
  NO_REFRESH_TOKEN = "NO_REFRESH_TOKEN",
  CSRF_REQUIRED = "CSRF_REQUIRED",
  INVALID_CSRF_TOKEN = "INVALID_CSRF_TOKEN",
}

export const AuthErrorStatus: Record<AuthErrorCode, number> = {
  [AuthErrorCode.USER_EXISTS]: 409,
  [AuthErrorCode.INVALID_CREDENTIALS]: 401,
  [AuthErrorCode.INVALID_REFRESH_TOKEN]: 401,
  [AuthErrorCode.INVALID_ACCESS_TOKEN]: 401,
  [AuthErrorCode.UNAUTHORIZED]: 401,
  [AuthErrorCode.NO_TOKEN]: 401,
  [AuthErrorCode.NO_REFRESH_TOKEN]: 403,
  [AuthErrorCode.CSRF_REQUIRED]: 403,
  [AuthErrorCode.INVALID_CSRF_TOKEN]: 403,
};

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}
