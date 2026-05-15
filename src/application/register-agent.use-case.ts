import type { CreateUserUseCase, CreateUserResult } from "@iam/app/create-user.use-case";
import type { CreateAgentProfileUseCase } from "@agent/app/create-agent-profile.use-case";

export type RegisterAgentCommand = {
  email: string;
  name?: string | null;
};

export class RegisterAgentUseCase {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly createAgentProfile: CreateAgentProfileUseCase,
  ) {}

  async execute(command: RegisterAgentCommand): Promise<CreateUserResult> {
    const user = await this.createUser.execute({ email: command.email, name: command.name });
    await this.createAgentProfile.execute({ userId: user.id });
    return user;
  }
}
