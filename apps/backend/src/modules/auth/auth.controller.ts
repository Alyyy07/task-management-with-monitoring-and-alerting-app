import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";
import { LoginBody, RegisterBody } from "./auth.types.js";
import { AuthError } from "./auth.errors.js";

export function buildAuthController(authService: AuthService) {
  return {
    async register(
      req: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply
    ) {
      try {
        const { email, password } = req.body;
        const user = await authService.register(email, password);
        return reply.status(201).send(user);
      } catch (err: any) {
        if (err instanceof AuthError && err.code === "USER_EXISTS") {
          return reply.status(409).send({ message: "User already exists" });
        }
        throw err;
      }
    },

    async login(req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
      try {
        const { email, password } = req.body;
        const { user, refreshToken } = await authService.login(email, password);

        const accessToken = req.server.jwt.sign(
          { userId: user.id },
          { expiresIn: "15m" }
        );

        return reply.send({ accessToken, refreshToken });
      } catch (err: any) {
        if (err instanceof AuthError && err.code === "INVALID_CREDENTIALS") {
          return reply
            .status(401)
            .send({ message: "Invalid email or password" });
        }
        throw err;
      }
    },

    async logout(
      req: FastifyRequest<{ Body: { refreshToken: string } }>,
      reply: FastifyReply
    ) {
      try {
        const { refreshToken } = req.body;

        await authService.revokeRefreshToken(refreshToken);

        return reply.status(204).send({ success: true });
      } catch (err: any) {
        if (err instanceof AuthError && err.code === "INVALID_REFRESH_TOKEN") {
          return reply.status(401).send({ message: "Invalid refresh token" });
        }
        throw err;
      }
    },

    async refreshToken(
      req: FastifyRequest<{ Body: { refreshToken: string } }>,
      reply: FastifyReply
    ) {
      try {
        const { refreshToken } = req.body;

        const { userId, refreshToken: newRefresh } =
          await authService.refreshToken(refreshToken);

        const accessToken = req.server.jwt.sign(
          { userId },
          { expiresIn: "15m" }
        );

        reply.send({
          accessToken,
          refreshToken: newRefresh,
        });
      } catch (err: any) {
        if (err instanceof AuthError && err.code === "INVALID_REFRESH_TOKEN") {
          return reply.status(401).send({ message: "Invalid refresh token" });
        }
        throw err;
      }
    },
  };
}
