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
      const { email, password } = req.body;
      const user = await authService.register(email, password);
      return reply.status(201).send(user);
    },

    async login(req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
      const { email, password } = req.body;
      const { user, refreshToken } = await authService.login(email, password);

      const accessToken = req.server.jwt.sign(
        { userId: user.id },
        { expiresIn: "15m" }
      );

      return reply.send({ accessToken, refreshToken });
    },

    async logout(
      req: FastifyRequest<{ Body: { refreshToken: string } }>,
      reply: FastifyReply
    ) {
      const { refreshToken } = req.body;

      await authService.revokeRefreshToken(refreshToken);

      return reply.status(204).send({ success: true });
    },

    async refreshToken(
      req: FastifyRequest<{ Body: { refreshToken: string } }>,
      reply: FastifyReply
    ) {
      const { refreshToken } = req.body;

      const { userId, refreshToken: newRefresh } =
        await authService.refreshToken(refreshToken);

      const accessToken = req.server.jwt.sign({ userId }, { expiresIn: "15m" });

      reply.send({
        accessToken,
        refreshToken: newRefresh,
      });
    },
  };
}
