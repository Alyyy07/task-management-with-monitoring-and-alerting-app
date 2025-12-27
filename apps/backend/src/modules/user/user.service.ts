import { requireSelf } from "../authz/authz.guard.js";
import { AuthContext } from "../authz/authz.type.js";
import { UserRepository } from "./user.types.js";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserProfile(context: AuthContext, userId: string) {
    requireSelf(context, userId);

    return this.userRepository.findById(userId);
  }
}
