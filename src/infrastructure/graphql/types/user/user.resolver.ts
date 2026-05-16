import { defineResolver } from "@infra/graphql/define-resolver";

export const userTypeResolver = defineResolver({
  User: {
    id: (user) => user.id,
    email: (user) => user.email,
    name: (user) => user.name,
    createdAt: (user) => user.createdAt,
  },
});
