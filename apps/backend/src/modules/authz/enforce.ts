import { AuthzError, AuthzErrorCode } from "./authz.errors.js";

export function enforce(
  allowed: boolean,
  error: AuthzErrorCode
) {
  if (!allowed) {
    throw new AuthzError(error);
  }
}