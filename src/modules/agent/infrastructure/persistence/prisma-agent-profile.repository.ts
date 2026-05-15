import type { DbClient } from "@infra/prisma/client";
import type { AgentProfileRepository } from "@agent/domain/agent-profile/repositories/agent-profile.repository.port";
import type { AgentProfile } from "@agent/domain/agent-profile/agent-profile.entity";

export class PrismaAgentProfileRepository implements AgentProfileRepository {
  constructor(private readonly client: DbClient) {}

  async save(profile: AgentProfile): Promise<void> {
    await this.client.agentProfile.create({
      data: {
        id: profile.id,
        userId: profile.userId,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  }
}
