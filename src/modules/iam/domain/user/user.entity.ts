import type { Email } from "@shared/value-objects/email.vo";

// Dans domain, je prefererais avoir un dossier /user qui contient un fichier Error, Repository, un dossier ValueObject

type UserProps = {
  id: string;
  email: Email;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(params: { id: string; email: Email; name?: string | null }): User {
    const now = new Date();
    return new User({
      id: params.id,
      email: params.email,
      name: params.name ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }
  get email(): Email {
    return this.props.email;
  }
  get name(): string | null {
    return this.props.name;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
