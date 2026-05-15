import type { CreateUserUseCase, CreateUserResult } from '../modules/iam/application/create-user.use-case';
import type { CreateAgentProfileUseCase } from '../modules/agent/application/create-agent-profile.use-case';

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
