import { TokenService } from "../modules/auth/auth.types.js";

export type JwtSigner = {
  sign(payload: object, options?: { expiresIn?: string | number }): string;
};

type JwtTokenServiceOptions = {
  accessTokenTtl: string | number;
};

export class JwtTokenService implements TokenService {
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
}
