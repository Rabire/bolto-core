type AgentProfileProps = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class AgentProfile {
  private constructor(private readonly props: AgentProfileProps) {}

  static create(params: { id: string; userId: string }): AgentProfile {
    const now = new Date();
    return new AgentProfile({ ...params, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: AgentProfileProps): AgentProfile {
    return new AgentProfile(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
