import type { UserRepository } from "../domain/user/repositories/user.repository.port";
import { UserNotFoundError } from "../domain/user/errors/user-not-found.error";

export type GetUserByIdResult = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<GetUserByIdResult> {
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
