import { authRepository } from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { AuthError, AuthErrorCode } from "./auth.errors.js";

export class AuthService {
  async register(email: string, password: string) {
    const exists = await authRepository.findByEmail(email);
    if (exists) {
      throw new AuthError(AuthErrorCode.USER_EXISTS);
    }

    const hashed = await hashPassword(password);
    const user = await authRepository.createUser(email, hashed);

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AuthError(AuthErrorCode.INVALID_CREDENTIALS);
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new AuthError(AuthErrorCode.INVALID_CREDENTIALS);
    }

    const newRefresh = await authRepository.createRefreshToken(user.id);

    return {
      user,
      refreshToken: newRefresh,
    };
  }

  async refreshToken(oldToken: string) {
    const stored = await authRepository.findValidRefreshToken(oldToken);
    if (!stored) {
      throw new AuthError(AuthErrorCode.INVALID_REFRESH_TOKEN);
    }

    await authRepository.revokeRefreshToken(stored.id);

    const newRefresh = await authRepository.createRefreshToken(stored.userId);

    return {
      userId: stored.userId,
      refreshToken: newRefresh,
    };
  }

  async revokeRefreshToken(rawToken: string) {
    const stored = await authRepository.findValidRefreshToken(rawToken);
    if (!stored) {
      throw new AuthError(AuthErrorCode.INVALID_REFRESH_TOKEN);
    }
    await authRepository.revokeRefreshToken(stored.id);
  }
}
