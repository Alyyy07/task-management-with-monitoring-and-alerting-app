// auth.service.ts
import crypto from "crypto";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { AuthError, AuthErrorCode } from "./auth.errors.js";
import { AuthRepository, AuthResult, TokenService } from "./auth.types.js";

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService
  ) {}

  async register(
    email: string,
    password: string,
    profile?: { firstName?: string; lastName?: string; avatarUrl?: string }
  ) {
    const exists = await this.authRepository.findByEmail(email);
    if (exists) {
      throw new AuthError(AuthErrorCode.USER_EXISTS);
    }

    const hashed = await hashPassword(password);
    const user = await this.authRepository.createUser(email, hashed, profile);

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new AuthError(AuthErrorCode.INVALID_CREDENTIALS);
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new AuthError(AuthErrorCode.INVALID_CREDENTIALS);
    }

    // Allow multi-session by removing global revocation

    const { id: refreshTokenId, raw: refreshToken } =
      await this.issueRefreshToken(user.id);
    const csrfToken = await this.issueCsrfToken(user.id, refreshTokenId);

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
    });

    return {
      accessToken,
      refreshToken,
      csrfToken,
    };
  }

  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const stored =
      await this.authRepository.findValidRefreshToken(rawRefreshToken);

    if (!stored) {
      throw new AuthError(AuthErrorCode.INVALID_REFRESH_TOKEN);
    }

    await this.authRepository.revokeRefreshToken(stored.id);
    // Revoke CSRF tokens for the specific session being refreshed
    await this.authRepository.revokeCsrfTokensBySession(stored.id);

    const { id: refreshTokenId, raw: refreshToken } =
      await this.issueRefreshToken(stored.userId);
    const csrfToken = await this.issueCsrfToken(stored.userId, refreshTokenId);

    const accessToken = this.tokenService.signAccessToken({
      userId: stored.userId,
    });

    return {
      accessToken,
      refreshToken,
      csrfToken,
    };
  }

  async revokeRefreshToken(rawToken: string) {
    const stored = await this.authRepository.findValidRefreshToken(rawToken);

    if (!stored) {
      throw new AuthError(AuthErrorCode.INVALID_REFRESH_TOKEN);
    }

    // Only revoke CSRF tokens for this specific session
    await this.authRepository.revokeCsrfTokensBySession(stored.id);
    await this.authRepository.revokeRefreshToken(stored.id);
  }

  private async issueRefreshToken(
    userId: string
  ): Promise<{ id: string; raw: string }> {
    const raw = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const stored = await this.authRepository.storeRefreshToken(
      userId,
      raw,
      expiresAt
    );

    return { id: stored.id, raw };
  }

  private async issueCsrfToken(
    userId: string,
    refreshTokenId?: string
  ): Promise<string> {
    const raw = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.authRepository.storeCsrfToken(
      userId,
      raw,
      expiresAt,
      refreshTokenId
    );

    return raw;
  }
}
