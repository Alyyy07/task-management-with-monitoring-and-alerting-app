import { authRepository } from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { AuthError } from "./auth.errors.js";

export class AuthService {
  async register(email: string, password: string) {
    const exists = await authRepository.findByEmail(email);
    if (exists) {
      throw new AuthError("USER_EXISTS");
    }

    const hashed = await hashPassword(password);
    const user = await authRepository.createUser(email, hashed);

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AuthError("INVALID_CREDENTIALS");
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new AuthError("INVALID_CREDENTIALS");
    }

    return user;
  }
}
