export enum AuthErrorCode {
  USER_EXISTS = "USER_EXISTS",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN",
  INVALID_ACCESS_TOKEN = "INVALID_ACCESS_TOKEN",
  UNAUTHORIZED = "UNAUTHORIZED",
  NO_TOKEN = "NO_TOKEN",

}
export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}
