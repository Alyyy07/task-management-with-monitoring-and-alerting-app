import { FastifyInstance } from "fastify";
import { buildAuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

type AuthRoutesOptions = {
  authService?: AuthService;
};

export async function authRoutes(
  app: FastifyInstance,
  opts: AuthRoutesOptions
) {
  const authService = opts?.authService || new AuthService();
  const controller = buildAuthController(authService);

  app.post("/login", controller.login);
  app.post("/register", controller.register);
  app.post("/refresh", controller.refreshToken);
  app.post("/logout", controller.logout);
}
