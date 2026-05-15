import type { DbClient } from "@infra/prisma/client";
import type { UserRepository } from "@iam/domain/user/repositories/user.repository.port";
import { User } from "@iam/domain/user/user.entity";
import { Email } from "@shared/value-objects/email.vo";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly client: DbClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.client.user.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.client.user.findUnique({
      where: { email: email.toString() },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.client.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.toString(),
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      update: {
        email: user.email.toString(),
        name: user.name,
        updatedAt: user.updatedAt,
      },
    });
  }

  private toDomain(row: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return User.reconstitute({
      id: row.id,
      email: Email.reconstitute(row.email),
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
