import { prisma } from "../../../infrastructure/prisma/client";
import { handleResolverError } from "../../../infrastructure/graphql/handle-resolver-error";
import { GetUserByIdUseCase } from "../application/get-user-by-id.use-case";
import { PrismaUserRepository } from "./persistence/prisma-user.repository";

export const userResolver = {
  Query: {
    getUserById: async (_: unknown, { id }: { id: string }) => {
      const useCase = new GetUserByIdUseCase(new PrismaUserRepository(prisma));
      const result = await useCase.execute(id).catch(handleResolverError);
      return { ...result, createdAt: result.createdAt.toISOString() };
    },
  },
};
