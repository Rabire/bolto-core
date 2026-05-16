import { ApolloServer } from "@apollo/server";
import type { BaseContext } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import type { Resolvers } from "@infra/graphql/types.generated";
import baseTypeDefs from "./base.gql";
import { formatError } from "./format-error";

// Tous les *.gql (sauf base.gql qui définit les types racine et doit passer en premier)
const schemaDefs: string[] = [];
for await (const file of new Bun.Glob("**/*.gql").scan(import.meta.dir)) {
  if (file !== "base.gql") {
    schemaDefs.push(await Bun.file(`${import.meta.dir}/${file}`).text());
  }
}

// Tous les *.resolver.ts — chaque fichier doit exporter `export const resolver = ...`
const allResolvers: Resolvers[] = [];
for await (const file of new Bun.Glob("**/*.resolver.ts").scan(import.meta.dir)) {
  const { resolver } = (await import(`${import.meta.dir}/${file}`)) as { resolver: Resolvers };
  allResolvers.push(resolver);
}

const server = new ApolloServer<BaseContext>({
  typeDefs: [baseTypeDefs, ...schemaDefs],
  resolvers: allResolvers,
  formatError,
});

const startApolloServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.info(`Server ready at: ${url}`);
};

export default startApolloServer;
