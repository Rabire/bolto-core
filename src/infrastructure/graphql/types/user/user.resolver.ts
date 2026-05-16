import { defineResolver } from "@infra/graphql/define-resolver";

export const resolver = defineResolver({
  User: {
    id: (user) => user.id,
    email: (user) => user.email,
    name: (user) => user.name,
    createdAt: (user) => user.createdAt,
  },
});
