import { ApolloServer } from "@apollo/server";
import type { BaseContext } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import baseTypeDefs from "./base.gql";
import userTypeDefs from "./types/user/user.type.gql";
import getUserByIdTypeDefs from "./queries/get-user-by-id/get-user-by-id.schema.gql";
import registerAgentTypeDefs from "./mutations/register-agent/register-agent.schema.gql";
import { userTypeResolver } from "./types/user/user.resolver";
import { getUserByIdResolver } from "./queries/get-user-by-id/get-user-by-id.resolver";
import { registerAgentResolver } from "./mutations/register-agent/register-agent.resolver";
import { formatError } from "./format-error";

const server = new ApolloServer<BaseContext>({
  typeDefs: [baseTypeDefs, userTypeDefs, getUserByIdTypeDefs, registerAgentTypeDefs],
  resolvers: [userTypeResolver, getUserByIdResolver, registerAgentResolver],
  formatError,
});

const startApolloServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.info(`Server ready at: ${url}`);
};

export default startApolloServer;
