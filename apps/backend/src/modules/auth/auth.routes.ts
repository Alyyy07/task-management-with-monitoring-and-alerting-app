import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { LoginBody, RegisterBody } from "./auth.types.js";
import { comparePassword } from "../../utils/password.js";
import { createAuditLog } from "../audit/audit.service.js";
import { loginUser, registerUser } from "./auth.service.js";

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/register",
    async (
      req: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply
    ) => {
      try {
        return await registerUser(req.body.email, req.body.password);
      } catch (err: any) {
        if (err.message === "USER_EXISTS") {
          return reply.status(400).send({ message: "User exists" });
        }
        throw err;
      }
    }
  );

  app.post(
    "/login",
    async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      try {
      const user = await loginUser(req.body.email, req.body.password);
      const token = app.jwt.sign({ userId: user.id });
      return { token };
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        return reply.status(401).send({ message: "Invalid credentials" });
      }
      throw err;
    }
  });
}
