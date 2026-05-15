import type { AgentProfile } from '../agent-profile.entity';

export interface AgentProfileRepository {
  save(profile: AgentProfile): Promise<void>;
}
