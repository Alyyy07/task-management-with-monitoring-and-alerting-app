// test/utils/buildTestApp.ts
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { buildAuthController } from "../../modules/auth/auth.controller.js";
import { registerErrorHandler } from "../../plugins/error-handler.plugin.js";

export function buildTestApp(authServiceMock: any) {
  const app = Fastify();
  registerErrorHandler(app);
  app.register(cookie);


  const controller = buildAuthController(authServiceMock);

  app.post("/auth/register", controller.register);
  app.post("/auth/login", controller.login);
  app.post("/auth/logout", controller.logout);
  app.post("/auth/refresh", controller.refresh);

  return app;
}
