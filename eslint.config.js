import boundaries from "eslint-plugin-boundaries";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    // Exclure les fichiers générés par Prisma de l'analyse
    ignores: ["src/infrastructure/prisma/generated/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "root", pattern: "src/index.ts" },
        { type: "shared", pattern: "src/shared/**/*" },
        { type: "global-infra", pattern: "src/infrastructure/**/*" },
        { type: "cross-app", pattern: "src/application/**/*" },
        // capture: ["moduleName"] permet à {{from.moduleName}} de restreindre
        // les imports intra-module sans config par module
        {
          type: "module-domain",
          pattern: "src/modules/*/domain/**/*",
          capture: ["moduleName"],
        },
        {
          type: "module-app",
          pattern: "src/modules/*/application/**/*",
          capture: ["moduleName"],
        },
        {
          type: "module-infra",
          pattern: "src/modules/*/infrastructure/**/*",
          capture: ["moduleName"],
        },
      ],
    },
    rules: {
      // Interdit les imports remontants (../) — utiliser les alias @module/layer/* à la place
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[source.value=/^\\.\\./]",
          message:
            "Les imports relatifs remontants (../) sont interdits. Utilisez les alias TypeScript : @iam/domain/..., @shared/..., @infra/..., etc.",
        },
      ],

      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            // shared kernel : zéro dépendance externe
            {
              from: { type: "shared" },
              allow: [{ to: { type: "shared" } }],
            },
            // domain : pur TypeScript, uniquement @shared + intra-domain même module
            {
              from: { type: "module-domain" },
              allow: [
                { to: { type: "shared" } },
                {
                  to: {
                    type: "module-domain",
                    captured: { moduleName: "{{from.captured.moduleName}}" },
                  },
                },
              ],
            },
            // application : domain du même module + @shared
            {
              from: { type: "module-app" },
              allow: [
                { to: { type: "shared" } },
                {
                  to: {
                    type: "module-domain",
                    captured: { moduleName: "{{from.captured.moduleName}}" },
                  },
                },
                {
                  to: {
                    type: "module-app",
                    captured: { moduleName: "{{from.captured.moduleName}}" },
                  },
                },
              ],
            },
            // infrastructure : toutes couches du même module + @infra + @shared
            {
              from: { type: "module-infra" },
              allow: [
                { to: { type: "shared" } },
                { to: { type: "global-infra" } },
                {
                  to: {
                    type: "module-domain",
                    captured: { moduleName: "{{from.captured.moduleName}}" },
                  },
                },
                {
                  to: {
                    type: "module-app",
                    captured: { moduleName: "{{from.captured.moduleName}}" },
                  },
                },
                {
                  to: {
                    type: "module-infra",
                    captured: { moduleName: "{{from.captured.moduleName}}" },
                  },
                },
              ],
            },
            // orchestration cross-contextes : peut appeler la couche app de n'importe quel module
            {
              from: { type: "cross-app" },
              allow: [
                { to: { type: "shared" } },
                { to: { type: "module-app" } },
                { to: { type: "cross-app" } },
              ],
            },
            // infrastructure globale (Apollo, Prisma) : point d'assemblage, accès total
            {
              from: { type: "global-infra" },
              allow: [
                { to: { type: "shared" } },
                { to: { type: "global-infra" } },
                { to: { type: "cross-app" } },
                { to: { type: "module-domain" } },
                { to: { type: "module-app" } },
                { to: { type: "module-infra" } },
              ],
            },
            // entry point : câble infra globale + orchestration
            {
              from: { type: "root" },
              allow: [
                { to: { type: "global-infra" } },
                { to: { type: "cross-app" } },
              ],
            },
          ],
        },
      ],
    },
  },
];
