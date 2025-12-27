export interface UserRepository {
  findById(userId: string): Promise<any | null>;
}