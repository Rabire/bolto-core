import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

const BOUNDARIES_ELEMENTS = [
  { type: "root", pattern: "src/index.ts" },
  { type: "shared", pattern: "src/shared/**/*" },
  { type: "global-infra", pattern: "src/infrastructure/**/*" },
  { type: "cross-app", pattern: "src/application/**/*" },
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
];

const BOUNDARIES_RULES = [
  { from: { type: "shared" }, allow: [{ to: { type: "shared" } }] },
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
  {
    from: { type: "cross-app" },
    allow: [
      { to: { type: "shared" } },
      { to: { type: "module-app" } },
      { to: { type: "cross-app" } },
    ],
  },
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
  {
    from: { type: "root" },
    allow: [
      { to: { type: "global-infra" } },
      { to: { type: "cross-app" } },
    ],
  },
];

export default tseslint.config(
  // ── Fichiers ignorés ──────────────────────────────────────────────────────
  { ignores: ["src/infrastructure/prisma/generated/**"] },

  // ── Presets + règles spécifiques au projet ────────────────────────────────
  {
    files: ["src/**/*.ts"],
    // strictTypeChecked + stylisticTypeChecked couvrent toutes les règles TS
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { boundaries },
    settings: {
      "boundaries/elements": BOUNDARIES_ELEMENTS,
    },
    rules: {
      // Imports relatifs remontants interdits — utiliser les alias TypeScript
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[source.value=/^\\.\\./]",
          message:
            "Les imports relatifs remontants (../) sont interdits. Utilisez les alias TypeScript : @iam/domain/..., @shared/..., @infra/..., etc.",
        },
      ],

      // console.log interdit, .info / .error / .warn autorisés
      "no-console": ["warn", { allow: ["info", "error", "warn"] }],

      // Conventions de nommage PascalCase + UPPER_CASE enums
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "class", format: ["PascalCase"] },
        { selector: "interface", format: ["PascalCase"] },
        { selector: "typeAlias", format: ["PascalCase"] },
        { selector: "enum", format: ["PascalCase"] },
        { selector: "enumMember", format: ["UPPER_CASE"] },
      ],

      // JS général
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-var": "error",

      // En DDD, `type` est préféré pour commands/DTOs (pas de merge accidentel)
      "@typescript-eslint/consistent-type-definitions": "off",

      // Frontières architecturales hexagonales
      "boundaries/dependencies": [
        "error",
        { default: "disallow", rules: BOUNDARIES_RULES },
      ],
    },
  },

  // ── Sur-couche domaine + shared (couches pures — contrats explicites) ─────
  {
    files: ["src/modules/*/domain/**/*.ts", "src/shared/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
    },
  },

  // ── Prettier en dernier — désactive les règles ESLint de style en conflit ─
  prettier,
);
