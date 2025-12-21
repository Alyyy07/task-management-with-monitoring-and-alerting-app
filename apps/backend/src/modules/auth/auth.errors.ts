export type AuthErrorCode =
  | "USER_EXISTS"
  | "INVALID_CREDENTIALS"
  | "INVALID_REFRESH_TOKEN";

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.code = code;
  }
}
