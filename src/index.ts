import startApolloServer from "@infra/graphql/index";
import { prisma } from "@infra/prisma/client";

async function main() {
  await startApolloServer();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
