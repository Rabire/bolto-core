import type { User } from "../user.entity";
import type { Email } from "../value-objects/email.vo";

export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
