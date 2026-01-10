import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  path: "/",
};

export function buildAuthController(authService: AuthService) {
  return {
    async register(req: FastifyRequest, reply: FastifyReply) {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const user = await authService.register(email, password);
      return reply.status(201).send(user);
    },

    async login(req: FastifyRequest, reply: FastifyReply) {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const { accessToken, refreshToken, csrfToken } = await authService.login(
        email,
        password
      );

      return reply
        .setCookie("refreshToken", refreshToken, refreshCookieOptions)
        .send({ accessToken, csrfToken });
    },

    async logout(req: FastifyRequest, reply: FastifyReply) {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        try {
          await authService.revokeRefreshToken(refreshToken);
        } catch {
          req.log.warn("Failed to revoke refresh token on logout");
        }
      }

      return reply
        .clearCookie("refreshToken", { path: "/" })
        .status(204)
        .send();
    },

    async refresh(req: FastifyRequest, reply: FastifyReply) {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return reply.status(401).send({ error: "Missing refresh token" });
      }

      const { accessToken, refreshToken: newRefresh } =
        await authService.refresh(refreshToken);

      return reply
        .setCookie("refreshToken", newRefresh, refreshCookieOptions)
        .send({ accessToken });
    },
  };
}
