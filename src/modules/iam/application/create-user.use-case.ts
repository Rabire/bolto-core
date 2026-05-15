import { randomUUID } from "crypto";
import { User } from "../domain/user/user.entity";
import { Email } from "../domain/user/value-objects/email.vo";
import type { UserRepository } from "../domain/user/repositories/user.repository.port";
import { UserAlreadyExistsError } from "../domain/user/errors/user-already-exists.error";

export type CreateUserCommand = {
  email: string;
  name?: string | null;
};

export type CreateUserResult = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const email = Email.create(command.email);

    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new UserAlreadyExistsError(email.toString());

    const user = User.create({
      id: randomUUID(),
      email,
      name: command.name,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email.toString(),
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
