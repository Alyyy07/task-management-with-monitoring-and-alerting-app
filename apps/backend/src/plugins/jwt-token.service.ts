import { TokenService } from "../modules/auth/auth.types.js";
import fp from "fastify-plugin";

export type JwtSigner = {
  sign(payload: object, options?: { expiresIn?: string | number }): string;
  verify(token: string): object;
};

type JwtTokenServiceOptions = {
  accessTokenTtl: string | number;
};

class JwtTokenService implements TokenService {
  constructor(
    private readonly signer: JwtSigner,
    private readonly options: JwtTokenServiceOptions
  ) {}

  signAccessToken(payload: { userId: string }): string {
    return this.signer.sign(
      { userId: payload.userId },
      { expiresIn: this.options.accessTokenTtl }
    );
  }

  verifyAccessToken(token: string): { userId: string } {
    console.log("Verifying token:", token);
    return this.signer.verify(token) as { userId: string };
  }
}

export const tokenServicePlugin = fp(async (app) => {
  const tokenService = new JwtTokenService(app.jwt, {
    accessTokenTtl: "15m",
  });

  app.decorate("tokenService", tokenService);
});
