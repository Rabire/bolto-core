import type { Resolvers } from "@infra/graphql/types.generated";
import { prisma } from "@infra/prisma/client";
import { GetUserByIdUseCase } from "@iam/app/get-user-by-id.use-case";
import { PrismaUserRepository } from "./persistence/prisma-user.repository";

export const userResolver: Resolvers = {
  Query: {
    getUserById: async (_, { id }) => {
      const useCase = new GetUserByIdUseCase(new PrismaUserRepository(prisma));
      return useCase.execute(id);
    },
  },
  User: {
    createdAt: (user) => user.createdAt.toISOString(),
  },
};
