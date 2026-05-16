import type { Resolvers } from "@infra/graphql/types.generated";

export const userTypeResolver: Resolvers = {
  User: {
    createdAt: (user) => user.createdAt.toISOString(),
  },
};
