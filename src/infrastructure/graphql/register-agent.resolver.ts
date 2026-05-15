import { prisma, type DbClient } from "../prisma/client";
import { RegisterAgentUseCase } from "../../application/register-agent.use-case";
import { CreateUserUseCase } from "../../modules/iam/application/create-user.use-case";
import { CreateAgentProfileUseCase } from "../../modules/agent/application/create-agent-profile.use-case";
import { PrismaUserRepository } from "../../modules/iam/infrastructure/persistence/prisma-user.repository";
import { PrismaAgentProfileRepository } from "../../modules/agent/infrastructure/persistence/prisma-agent-profile.repository";

type RegisterAgentInput = { email: string; name?: string | null };

export const registerAgentResolver = {
  Mutation: {
    registerAgent: async (_: unknown, { input }: { input: RegisterAgentInput }) => {
      const result = await prisma.$transaction(async (tx: DbClient) => {
        const useCase = new RegisterAgentUseCase(
          new CreateUserUseCase(new PrismaUserRepository(tx)),
          new CreateAgentProfileUseCase(new PrismaAgentProfileRepository(tx)),
        );
        return useCase.execute(input);
      });
      return { user: { ...result, createdAt: result.createdAt.toISOString() } };
    },
  },
};
