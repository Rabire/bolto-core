import type { Resolvers } from "@infra/graphql/types.generated";
import { prisma, type DbClient } from "@infra/prisma/client";
import { RegisterAgentUseCase } from "@app/register-agent.use-case";
import { CreateUserUseCase } from "@iam/app/create-user.use-case";
import { CreateAgentProfileUseCase } from "@agent/app/create-agent-profile.use-case";
import { PrismaUserRepository } from "@iam/infra/persistence/prisma-user.repository";
import { PrismaAgentProfileRepository } from "@agent/infra/persistence/prisma-agent-profile.repository";

export const registerAgentResolver: Resolvers = {
  Mutation: {
    registerAgent: async (_, { input }) => {
      const result = await prisma.$transaction(async (tx: DbClient) => {
        const useCase = new RegisterAgentUseCase(
          new CreateUserUseCase(new PrismaUserRepository(tx)),
          new CreateAgentProfileUseCase(new PrismaAgentProfileRepository(tx)),
        );
        return useCase.execute(input);
      });
      return { user: result };
    },
  },
};
