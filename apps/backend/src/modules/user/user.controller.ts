import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "./user.service.js";

export function buildUserController(userService: UserService) {
  return {
    async getUserById(request: FastifyRequest, reply: FastifyReply) {
      const params = request.params as { id: string };
      const userProfile = await userService.getUserById(
        { userId: request.user.userId },
        params.id
      );
      return reply.status(200).send(userProfile);
    },

    async getUserProfile(request: FastifyRequest, reply: FastifyReply) {
      const userProfile = await userService.getUserProfile({
        userId: request.user.userId,
      });
      return reply.status(200).send(userProfile);
    },
  };
}
