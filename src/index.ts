import startApolloServer from "@infra/graphql/index";
import { prisma } from "@infra/prisma/client";

async function main() {
  startApolloServer();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
