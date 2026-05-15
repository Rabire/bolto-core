import { randomUUID } from "crypto";
import { User } from "@iam/domain/user/user.entity";
import { Email } from "@shared/value-objects/email.vo";
import type { UserRepository } from "@iam/domain/user/repositories/user.repository.port";
import { UserAlreadyExistsError } from "@iam/domain/user/errors/user-already-exists.error";
import type { UserDto } from "@iam/app/user.dto";

export type CreateUserCommand = {
  email: string;
  name?: string | null;
};

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<UserDto> {
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
