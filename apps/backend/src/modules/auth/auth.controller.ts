import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";
import { LoginBody, RegisterBody } from "./auth.types.js";

const authService = new AuthService();

export const authController = {
  async register(
    req: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) {
    try {
      const user = await authService.register(
        req.body.email,
        req.body.password
      );
      return reply.status(201).send(user);
    } catch (err: any) {
      if (err.message === "USER_EXISTS") {
        return reply.status(400).send({ message: "User already exists" });
      }
      throw err;
    }
  },

  async login(
    req: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) {
    try {
      const user = await authService.login(
        req.body.email,
        req.body.password
      );

      const token = reply.server.jwt.sign({ userId: user.id, type: "access" });

      return { token };
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        return reply.status(401).send({ message: "Invalid credentials" });
      }
      throw err;
    }
  },
};
