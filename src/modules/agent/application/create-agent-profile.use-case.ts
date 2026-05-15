import { randomUUID } from "crypto";
import { AgentProfile } from "@agent/domain/agent-profile/agent-profile.entity";
import type { AgentProfileRepository } from "@agent/domain/agent-profile/repositories/agent-profile.repository.port";

export type CreateAgentProfileCommand = {
  userId: string;
};

export class CreateAgentProfileUseCase {
  constructor(
    private readonly agentProfileRepository: AgentProfileRepository,
  ) {}

  async execute(command: CreateAgentProfileCommand): Promise<void> {
    const profile = AgentProfile.create({
      id: randomUUID(),
      userId: command.userId,
    });
    await this.agentProfileRepository.save(profile);
  }
}
