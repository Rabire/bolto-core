import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import baseTypeDefs from "./base.gql";
import iamTypeDefs from "@iam/infra/iam.schema.gql";
import agentTypeDefs from "@agent/infra/agent.schema.gql";
import { registerAgentResolver } from "./register-agent.resolver";
import { userResolver } from "@iam/infra/user.resolver";
import { formatError } from "./format-error";

const server = new ApolloServer({
  typeDefs: [baseTypeDefs, iamTypeDefs, agentTypeDefs],
  resolvers: [registerAgentResolver, userResolver],
  formatError,
});

const startApolloServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`Server ready at: ${url}`);
};

export default startApolloServer;
