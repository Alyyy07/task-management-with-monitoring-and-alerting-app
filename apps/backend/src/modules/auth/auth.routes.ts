import { FastifyInstance } from "fastify";
import { buildAuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import {
  loginSchema,
  logoutSchema,
  registerSchema,
} from "./auth.schema.js";
import { csrfGuard } from "../../plugins/csrf.js";
import { authRepository } from "./auth.repository.js";

type AuthRoutesOptions = {
  authService?: AuthService;
};

export async function authRoutes(
  app: FastifyInstance,
  opts: AuthRoutesOptions
) {
    const tokenService = app.tokenService;

  const authService =
    opts.authService || new AuthService(authRepository, tokenService);

  const controller = buildAuthController(authService);

  app.post(
    "/login",
    {
      schema: loginSchema,
    },
    controller.login
  );
  app.post(
    "/register",
    {
      schema: registerSchema,
    },
    controller.register
  );
  app.post(
    "/refresh",
    {
      preHandler: [app.authenticate, csrfGuard],
    },
    controller.refresh
  );

  app.post(
    "/logout",
    {
      preHandler: [app.authenticate, csrfGuard],
      schema: logoutSchema,
    },
    controller.logout
  );
}
