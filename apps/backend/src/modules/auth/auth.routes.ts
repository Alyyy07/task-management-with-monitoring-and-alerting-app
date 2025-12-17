import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../libs/prisma.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { RegisterBody, LoginBody } from "./auth.types.js";

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/register",
    async (req: FastifyRequest<{ Body: RegisterBody }>, reply) => {
      const { email, password } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return reply.status(400).send({ message: "User exists" });
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: await hashPassword(password)
        }
      });

      return { id: user.id, email: user.email };
    }
  );

  app.post(
    "/login",
    async (req: FastifyRequest<{ Body: LoginBody }>, reply) => {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.status(401).send({ message: "Invalid credentials" });
      }

      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return reply.status(401).send({ message: "Invalid credentials" });
      }

      const token = app.jwt.sign({ userId: user.id });

      return { token };
    }
  );
}
