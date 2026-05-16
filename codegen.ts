import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/**/*.gql",
  generates: {
    "src/infrastructure/graphql/types.generated.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useTypeImports: true,
        strictScalars: true,
        enumsAsTypes: true,
        scalars: {
          ID: "string",
          Date: "Date",
        },
        mappers: {
          User: "@iam/app/user.dto#UserDto",
        },
      },
    },
  },
};

export default config;
