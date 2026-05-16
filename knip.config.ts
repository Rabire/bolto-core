import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // entry et prisma.config.ts sont auto-détectés via package.json et le plugin Prisma
  // Les *.resolver.ts sont chargés dynamiquement via Bun.Glob — knip ne peut pas les suivre statiquement
  entry: ["src/**/*.resolver.ts"],
  project: ["src/**/*.ts"],
  ignore: ["src/infrastructure/graphql/types.generated.ts"],

  ignoreDependencies: [
    // @prisma/client est importé depuis le client généré local (./generated/client), pas directement
    "@prisma/client",
    // pg est chargé indirectement par @prisma/adapter-pg (aucun import direct dans le code)
    "pg",
    // @types/pg : types implicites résolus par TypeScript via pg, aucun import explicite
    "@types/pg",
    // bundlés dans le meta-package typescript-eslint — aucun import direct dans eslint.config.js
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
  ],
};

export default config;
