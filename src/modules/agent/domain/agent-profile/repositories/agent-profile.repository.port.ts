import type { AgentProfile } from '@agent/domain/agent-profile/agent-profile.entity';

export interface AgentProfileRepository {
  save(profile: AgentProfile): Promise<void>;
}
