import { FastifyInstance } from "fastify";
import { UserService } from "./user.service.js";
import { buildUserController } from "./user.controller.js";
import { userRepository } from "./user.repository.js";

type UserRoutesOptions = {
  userService?: UserService;
};

export async function userRoutes(app: FastifyInstance,opts:UserRoutesOptions) {
  const userService = opts.userService || new UserService(userRepository);

  const controller = buildUserController(userService);

  app.get("/:id", { preHandler: app.authenticate }, controller.getUserById);
}
