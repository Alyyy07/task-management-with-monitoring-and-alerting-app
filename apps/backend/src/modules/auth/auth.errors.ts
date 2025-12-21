export type AuthErrorCode =
  | "USER_EXISTS"
  | "INVALID_CREDENTIALS";

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.code = code;
  }
}
