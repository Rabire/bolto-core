import { GraphQLError } from "graphql";
import { prisma, type DbClient } from "../prisma/client";
import { RegisterAgentUseCase } from "../../application/register-agent.use-case";
import { CreateUserUseCase } from "../../modules/iam/application/create-user.use-case";
import { CreateAgentProfileUseCase } from "../../modules/agent/application/create-agent-profile.use-case";
import { PrismaUserRepository } from "../../modules/iam/infrastructure/persistence/prisma-user.repository";
import { PrismaAgentProfileRepository } from "../../modules/agent/infrastructure/persistence/prisma-agent-profile.repository";
import { UserAlreadyExistsError } from "../../modules/iam/domain/errors/user-already-exists.error";
import { InvalidEmailError } from "../../modules/iam/domain/value-objects/email.vo";

type RegisterAgentInput = { email: string; name?: string | null };

export const registerAgentResolver = {
  Mutation: {
    registerAgent: async (_: unknown, { input }: { input: RegisterAgentInput }) => {
      try {
        const result = await prisma.$transaction(async (tx: DbClient) => {
          const useCase = new RegisterAgentUseCase(
            new CreateUserUseCase(new PrismaUserRepository(tx)),
            new CreateAgentProfileUseCase(new PrismaAgentProfileRepository(tx)),
          );
          return await useCase.execute(input);
        });
        return { user: { ...result, createdAt: result.createdAt.toISOString() } };
      } catch (error) {
        if (error instanceof UserAlreadyExistsError) {
          throw new GraphQLError(error.message, { extensions: { code: "USER_ALREADY_EXISTS" } });
        }
        if (error instanceof InvalidEmailError) {
          throw new GraphQLError(error.message, { extensions: { code: "INVALID_INPUT" } });
        }
        throw error;
      }
    },
  },
};
