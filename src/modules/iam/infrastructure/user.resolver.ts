import { prisma } from "@infra/prisma/client";
import { GetUserByIdUseCase } from "@iam/app/get-user-by-id.use-case";
import { PrismaUserRepository } from "./persistence/prisma-user.repository";

export const userResolver = {
  Query: {
    getUserById: async (_: unknown, { id }: { id: string }) => {
      const useCase = new GetUserByIdUseCase(new PrismaUserRepository(prisma));
      const result = await useCase.execute(id);
      return { ...result, createdAt: result.createdAt.toISOString() };
    },
  },
};
