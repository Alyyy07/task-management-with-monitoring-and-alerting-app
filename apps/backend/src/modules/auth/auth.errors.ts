import { AppError } from "../../utils/app.error.js";

export enum AuthErrorCode {
  USER_EXISTS = "USER_EXISTS",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN",
  INVALID_ACCESS_TOKEN = "INVALID_ACCESS_TOKEN",
  UNAUTHORIZED = "UNAUTHORIZED",
  NO_TOKEN = "NO_TOKEN",

}

const STATUS_MAP: Record<AuthErrorCode, number> = {
  USER_EXISTS: 409,
  INVALID_CREDENTIALS: 401,
  INVALID_REFRESH_TOKEN: 401,
  INVALID_ACCESS_TOKEN: 401,
  UNAUTHORIZED: 401,
  NO_TOKEN: 401,
};

const MESSAGE_MAP: Record<AuthErrorCode, string> = {
  USER_EXISTS: "User already exists",
  INVALID_CREDENTIALS: "Invalid email or password",
  INVALID_REFRESH_TOKEN: "Invalid refresh token",
  UNAUTHORIZED: "Unauthorized access",
  NO_TOKEN: "No token provided",
  INVALID_ACCESS_TOKEN: "Invalid access token",
};
export class AuthError extends AppError {
  constructor(code: AuthErrorCode) {

    super(code, STATUS_MAP[code], MESSAGE_MAP[code]);
  }
}
