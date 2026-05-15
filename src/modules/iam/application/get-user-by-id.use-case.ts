import type { UserRepository } from "@iam/domain/user/repositories/user.repository.port";
import { UserNotFoundError } from "@iam/domain/user/errors/user-not-found.error";
import type { UserDto } from "@iam/app/user.dto";

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new UserNotFoundError(id);

    return {
      id: user.id,
      email: user.email.toString(),
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
