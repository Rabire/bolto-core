import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "./generated/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
// TODO: .env parsing + validation (e.g. with zod) to ensure all required env vars are set and correctly formatted

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });

export { Prisma };
export type DbClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
