import { AppError } from "../../utils/app.error.js";

export type AuthErrorCode =
  | "USER_EXISTS"
  | "INVALID_CREDENTIALS"
  | "INVALID_REFRESH_TOKEN";

export class AuthError extends AppError {
  constructor(code: AuthErrorCode) {
    const statusMap: Record<AuthErrorCode, number> = {
      USER_EXISTS: 409,
      INVALID_CREDENTIALS: 401,
      INVALID_REFRESH_TOKEN: 401,
    };

    const messageMap: Record<AuthErrorCode, string> = {
      USER_EXISTS: "User already exists",
      INVALID_CREDENTIALS: "Invalid email or password",
      INVALID_REFRESH_TOKEN: "Invalid refresh token",
    };

    super(code, statusMap[code], messageMap[code]);
  }
}
