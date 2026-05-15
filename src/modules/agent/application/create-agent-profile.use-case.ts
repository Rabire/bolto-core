import { randomUUID } from "crypto";
import { AgentProfile } from "../domain/agent-profile.entity";
import type { AgentProfileRepository } from "../domain/repositories/agent-profile.repository.port";

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
