import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "./user.service.js";

export function buildUserController(userService: UserService) {
  return {
    async getProfile(request: FastifyRequest, reply: FastifyReply) {
      const params = request.params as { id: string };
      const userProfile = await userService.getUserProfile(
        { userId: request.user.userId },
        params.id
      );
      return reply.send(userProfile);
    },
  };
}
