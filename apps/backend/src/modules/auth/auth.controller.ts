import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";
import { LoginBody, RegisterBody } from "./auth.types.js";

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
      const { user, refreshToken, csrfToken } = await authService.login(
        email,
        password
      );

      const accessToken = req.server.jwt.sign(
        { userId: user.id },
        { expiresIn: "15m" }
      );

      return reply
        .setCookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
          path: "/auth",
        })
        .send({ accessToken, csrfToken });
    },

    async logout(req: FastifyRequest, reply: FastifyReply) {
      const { refreshToken } = req.body as { refreshToken: string };

      await authService.revokeRefreshToken(refreshToken);

      return reply
        .status(204)
        .clearCookie("refreshToken", { path: "/auth" })
        .send({ success: true });
    },

    async refreshToken(req: FastifyRequest, reply: FastifyReply) {
      const { refreshToken } = req.body as { refreshToken: string };
      const { userId, newRefresh } = await authService.refreshToken(
        refreshToken
      );

      const accessToken = req.server.jwt.sign({ userId }, { expiresIn: "15m" });

      reply
        .setCookie("refreshToken", newRefresh, {
          httpOnly: true,
          sameSite: "strict",
          path: "/auth",
        })
        .send({
          accessToken,
        });
    },
  };
}
