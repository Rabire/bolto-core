import type { User } from "@iam/domain/user/user.entity";
import type { Email } from "@shared/value-objects/email.vo";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
