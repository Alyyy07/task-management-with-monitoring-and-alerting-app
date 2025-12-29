import { requireSelf } from "../authz/authz.guard.js";
import { AuthContext } from "../authz/authz.type.js";
import { UserRepository } from "./user.types.js";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(context: AuthContext, targetUserId: string) {
    requireSelf(context, targetUserId);

    return this.userRepository.findById(targetUserId);
  }

  async getUserProfile(context: AuthContext) {
    return this.userRepository.findById(context.userId);
  }
}
