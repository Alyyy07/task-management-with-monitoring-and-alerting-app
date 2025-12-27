export interface RegisterBody {
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AccessTokenPayload {
  userId: string;
}
export interface TokenService {
  signAccessToken(payload: { userId: string }): string;
  verifyAccessToken(token: string): { userId: string };
}
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<any | null>;

  createUser(email: string, hashedPassword: string): Promise<any>;

  storeRefreshToken(
    userId: string,
    rawToken: string,
    expiresAt: Date
  ): Promise<void>;

  findValidRefreshToken(rawToken: string): Promise<{
    id: string;
    userId: string;
  } | null>;

  revokeRefreshToken(id: string): Promise<void>;

  revokeAllRefreshTokens(userId: string): Promise<void>;

  storeCsrfToken(
    userId: string,
    rawToken: string,
    expiresAt: Date
  ): Promise<void>;

  revokeCsrfTokens(userId: string): Promise<void>;
}
