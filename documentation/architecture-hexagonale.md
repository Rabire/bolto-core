# Architecture hexagonale & DDD — bolto-core

## Principe fondamental

Les dépendances pointent **toujours vers le centre**. Le domaine ne sait pas que Prisma, GraphQL ou Bun existent.

```
infrastructure → application → domain
```

---

## Les 3 couches

| Couche            | Rôle                                                | Peut importer                        |
| ----------------- | --------------------------------------------------- | ------------------------------------ |
| `domain/`         | Règles métier pures. Entités, value objects, ports. | Rien (TypeScript vanilla uniquement) |
| `application/`    | Orchestration. Use-cases.                           | `domain/` uniquement                 |
| `infrastructure/` | Technologie. Prisma, GraphQL, HTTP.                 | `application/` + `domain/`           |

---

## Structure d'un module

Le domaine est organisé **par agrégat** — chaque agrégat a son propre sous-dossier qui regroupe l'entité, ses value objects, son port de repository et ses erreurs.

```
src/modules/<contexte>/
├── domain/
│   └── <entity>/                          ← un dossier par agrégat
│       ├── <entity>.entity.ts
│       ├── value-objects/
│       │   └── <nom>.vo.ts
│       ├── repositories/
│       │   └── <entity>.repository.port.ts
│       └── errors/
│           └── <nom>.error.ts
├── application/
│   └── <action>.use-case.ts                ← command + use-case dans le même fichier
└── infrastructure/
    ├── <module>.schema.gql                 ← schéma GraphQL (si 1 seul fichier graphql)
    ├── graphql/                            ← dossier créé seulement si 2+ fichiers graphql
    │   ├── <module>.schema.gql
    │   └── <module>.resolver.ts
    └── persistence/
        └── prisma-<entity>.repository.ts  ← implémente le port avec Prisma
```

Exemple réel — module `iam/` avec deux agrégats futurs :

```
iam/domain/
├── user/
│   ├── user.entity.ts
│   ├── value-objects/email.vo.ts
│   ├── repositories/user.repository.port.ts
│   └── errors/
│       ├── user-not-found.error.ts
│       └── user-already-exists.error.ts
└── session/                                ← futur agrégat Session
    ├── session.entity.ts
    └── repositories/session.repository.port.ts
```

**Règle clé** : un dossier n'est créé que s'il contient au moins 2 fichiers. Un seul fichier va directement dans le dossier parent.

---

## Conventions de nommage

### Suffixes de fichiers

| Suffixe               | Rôle                        | Exemple                      |
| --------------------- | --------------------------- | ---------------------------- |
| `.entity.ts`          | Entité ou agrégat           | `user.entity.ts`             |
| `.vo.ts`              | Value Object                | `email.vo.ts`                |
| `.repository.port.ts` | Interface repository (port) | `user.repository.port.ts`    |
| `.use-case.ts`        | Use-case + command          | `create-user.use-case.ts`    |
| `.resolver.ts`        | Adapter GraphQL             | `register-agent.resolver.ts` |
| `.schema.gql`         | Schéma GraphQL              | `iam.schema.gql`             |
| `.error.ts`           | Erreur métier               | `already-exists.error.ts`    |

### Règles de nommage

- **Interfaces** : pas de préfixe `I`. `UserRepository` et non `IUserRepository`.
- **Schémas GraphQL** : nommés d'après le **module**, pas l'entité. `iam.schema.gql` contiendra `User`, `Session`, `Token`… Si nommé `user.schema.gql`, il faudrait le renommer dès l'ajout d'une deuxième entité.
- **Erreurs** : sans préfixe de contexte dans le nom de fichier — le dossier `errors/` situé dans `iam/domain/` donne déjà le contexte.
- **Tout en kebab-case** pour les fichiers et dossiers. `agent-profile.entity.ts`, pas `agentProfile.entity.ts`.
- **Dossiers au pluriel** : `value-objects/`, `repositories/`, `errors/`.

---

## Command et use-case dans le même fichier

La command (type des données d'entrée) et le use-case vivent dans le même fichier. Pas de fichier `<action>.command.ts` séparé — un type de 3 lignes ne justifie pas un fichier dédié.

```typescript
// create-user.use-case.ts — command + use-case + result dans un seul fichier

export type CreateUserCommand = {
  email: string;
  name?: string | null;
};

export type CreateUserResult = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(command: CreateUserCommand): Promise<CreateUserResult> { ... }
}
```

---

## Ajouter un use-case : recette

1. **Domain** — créer ou réutiliser l'entité et ses value objects
2. **Port** — déclarer la méthode nécessaire dans `<nom>.repository.port.ts`
3. **Use-case** — créer `<action>.use-case.ts` avec la command, le result type, et la classe
4. **Repository** — implémenter la méthode dans `prisma-<nom>.repository.ts`
5. **Schema** — ajouter le type/mutation/query dans `<module>.schema.gql`
6. **Resolver** — câbler le use-case dans le bon resolver (voir section ci-dessous)

---

## Placement des resolvers

### Resolver de module

Un resolver vit dans `infrastructure/` du module **quand il expose une opération propre à ce module** (ex. `agentProfile(id: ID!)` pour `agent/`).

```
src/modules/agent/infrastructure/graphql/
├── agent.schema.gql
└── agent.resolver.ts    ← opérations propres au module agent
```

### Resolver cross-contexte

Un resolver cross-contexte vit dans `src/infrastructure/graphql/` — même niveau que le use-case orchestrateur dans `src/application/`.

```
src/
├── application/
│   └── register-agent.use-case.ts       ← orchestration iam/ + agent/
└── infrastructure/graphql/
    └── register-agent.resolver.ts       ← adapter GraphQL de cette orchestration
```

**Règle** : si la mutation appelle un use-case dans `src/application/`, son resolver est dans `src/infrastructure/graphql/`. Si elle appelle un use-case dans `src/modules/<ctx>/application/`, son resolver est dans `src/modules/<ctx>/infrastructure/`.

---

## Les transactions cross-contextes

### Problème

Une mutation peut nécessiter de créer des entités dans **deux bounded contexts différents** (ex. `registerAgent` crée un `User` dans `iam/` et un `AgentProfile` dans `agent/`). Appeler deux use-cases séquentiellement sans transaction = risque d'état incohérent si le second échoue.

### Solution : use-case orchestrateur à la racine

```
src/application/register-agent.use-case.ts   ← pur, zéro import Prisma/GraphQL
src/infrastructure/graphql/register-agent.resolver.ts  ← gère la transaction
```

Le **resolver** crée la transaction et instancie les repositories qui y participent. Le use-case orchestrateur reste ignorant de Prisma.

```typescript
// register-agent.resolver.ts
prisma.$transaction(async (tx: DbClient) => {
  const useCase = new RegisterAgentUseCase(
    new CreateUserUseCase(new PrismaUserRepository(tx)),
    new CreateAgentProfileUseCase(new PrismaAgentProfileRepository(tx)),
  );
  return await useCase.execute(input);
});
```

Si `CreateAgentProfileUseCase` échoue → rollback automatique → `User` non créé.

### Règle de choix

| Situation                                              | Solution                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| 2 entités du même contexte                             | 1 use-case + transaction dans le resolver                         |
| 2 entités de contextes différents                      | use-case orchestrateur à la racine + transaction dans le resolver |
| Contextes découplés acceptant l'incohérence temporaire | Domain event + outbox pattern                                     |

---

## Gestion des erreurs

### Principe

Les erreurs métier sont des classes du domaine — elles ne connaissent ni GraphQL ni HTTP. La conversion vers le format GraphQL se fait en un seul endroit : `src/infrastructure/graphql/format-error.ts`, branché sur le hook `formatError` d'Apollo Server.

```
domain        → throw UserNotFoundError(id)          ← erreur métier pure
    ↓
Apollo Server → intercepte, appelle formatError(formattedError, originalError)
    ↓
format-error  → instanceof check → { message, extensions: { code } }
    ↓
client        → reçoit un message lisible + un code d'erreur structuré
```

### Erreurs domaine

Chaque erreur métier est une classe dans `domain/<entity>/errors/`. Elle étend `Error` et fixe `this.name` pour l'identification à l'exécution.

```typescript
// user-not-found.error.ts
export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`Aucun utilisateur trouvé avec l'id "${id}"`);
    this.name = "UserNotFoundError";
  }
}
```

### Enregistrement dans formatError

```typescript
// src/infrastructure/graphql/format-error.ts
export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  if (error instanceof UserNotFoundError)
    return { message: error.message, extensions: { code: "NOT_FOUND" } };
  if (error instanceof UserAlreadyExistsError)
    return { message: error.message, extensions: { code: "USER_ALREADY_EXISTS" } };
  // ...
  return formattedError; // erreur inattendue → Apollo la masque en "Internal server error"
}
```

Apollo passe l'erreur **originale** (avant tout masquage) en second paramètre — les `instanceof` fonctionnent toujours.

### Ce que ça implique pour les resolvers

Les resolvers ne contiennent **aucune gestion d'erreur**. Ils laissent les erreurs domaine remonter naturellement.

```typescript
// ✅ Resolver sans try/catch — les erreurs remontent vers formatError
getUserById: async (_: unknown, { id }: { id: string }) => {
  const result = await useCase.execute(id);
  return { ...result, createdAt: result.createdAt.toISOString() };
},
```

### Ajouter une erreur dans un nouveau module

1. Créer la classe dans `domain/<entity>/errors/<nom>.error.ts`
2. L'importer dans `src/infrastructure/graphql/format-error.ts`
3. Ajouter le `instanceof` avec le code GraphQL approprié

Les resolvers n'ont pas à être modifiés.

---

## Injection de dépendances

Pas de container DI pour l'instant. Le câblage se fait dans le resolver (composition root).

```typescript
// Le seul endroit où les classes concrètes sont instanciées
new RegisterAgentUseCase(
  new CreateUserUseCase(new PrismaUserRepository(tx)),
  new CreateAgentProfileUseCase(new PrismaAgentProfileRepository(tx)),
);
```

Les use-cases ne connaissent que des interfaces. Tester un use-case = passer un repository en mémoire.

---

## Les repositories Prisma

### Injection du client

Les repositories acceptent un `DbClient` en constructeur — soit `prisma` (client normal), soit `tx` (client transactionnel).

```typescript
// src/infrastructure/prisma/client.ts — définition
export type DbClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Dans un repository
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly client: DbClient) {}
}

// Usage normal (sans transaction)
new PrismaUserRepository(prisma);

// Usage dans une transaction
prisma.$transaction(async (tx) => {
  new PrismaUserRepository(tx);
});
```

### Règle : ne jamais importer depuis `generated/`

`generated/` est un artefact de build — traite-le comme `node_modules`. `client.ts` est la **façade unique** pour tout ce qui vient de Prisma.

```typescript
// ✅ Correct
import { prisma, Prisma, type DbClient } from "../../infrastructure/prisma/client";

// ❌ Interdit
import { Prisma } from "../../infrastructure/prisma/generated/client";
```

Si Prisma change son chemin de sortie, seul `client.ts` est à mettre à jour.

### create vs reconstitute

Chaque entité expose deux constructeurs statiques :

| Méthode                      | Usage                       | Effets                                          |
| ---------------------------- | --------------------------- | ----------------------------------------------- |
| `Entity.create(params)`      | Nouvelle entité             | Timestamps auto, peut émettre des domain events |
| `Entity.reconstitute(props)` | Reconstruction depuis la DB | Aucun effet de bord                             |

`Email.create(raw)` valide l'entrée utilisateur (regex, lowercase, trim). `Email.reconstitute(value)` bypass la validation — uniquement dans `toDomain()` d'un repository.

---

## Alias de chemins & frontières architecturales

### Alias TypeScript

Les imports utilisent des alias absolus définis dans [tsconfig.json](../tsconfig.json). La convention est `@<module>/<layer>/*`, ce qui rend la couche visible directement dans l'import.

| Alias             | Pointe vers                          | Couche                                  |
| ----------------- | ------------------------------------ | --------------------------------------- |
| `@shared/*`       | `src/shared/*`                       | Shared kernel                           |
| `@infra/*`        | `src/infrastructure/*`               | Infrastructure globale (Prisma, Apollo) |
| `@app/*`          | `src/application/*`                  | Use-cases cross-contextes               |
| `@iam/domain/*`   | `src/modules/iam/domain/*`           | Domaine `iam`                           |
| `@iam/app/*`      | `src/modules/iam/application/*`      | Application `iam`                       |
| `@iam/infra/*`    | `src/modules/iam/infrastructure/*`   | Infrastructure `iam`                    |
| `@agent/domain/*` | `src/modules/agent/domain/*`         | Domaine `agent`                         |
| `@agent/app/*`    | `src/modules/agent/application/*`    | Application `agent`                     |
| `@agent/infra/*`  | `src/modules/agent/infrastructure/*` | Infrastructure `agent`                  |

Exemple d'import dans un repository Prisma :

```typescript
// ❌ Avant — chemin relatif opaque, fragile
import type { DbClient } from "../../../../infrastructure/prisma/client";
import { User } from "../../domain/user/user.entity";

// ✅ Après — couche lisible, stable
import type { DbClient } from "@infra/prisma/client";
import { User } from "@iam/domain/user/user.entity";
```

> **Note Bun** : Bun lit `tsconfig.json` nativement depuis Bun 1.0 — aucune config supplémentaire dans `bunfig.toml`.

### Enforcement des frontières (ESLint)

Les règles architecturales sont enforced à l'exécution via `eslint-plugin-boundaries` ([eslint.config.js](../eslint.config.js)).

```bash
bun run lint       # vérifier
bun run lint:fix   # corriger auto ce qui peut l'être
```

Les violations sont des **erreurs** (pas des warnings) — le CI doit bloquer dessus.

**Matrice des dépendances autorisées :**

| Couche source                   | Peut importer depuis                                                    |
| ------------------------------- | ----------------------------------------------------------------------- |
| `shared`                        | `shared` uniquement                                                     |
| `module-domain`                 | `shared` · `module-domain` du même module                               |
| `module-app`                    | `shared` · `module-domain` du même module · `module-app` du même module |
| `module-infra`                  | `shared` · `global-infra` · les 3 couches du même module                |
| `cross-app` (orchestration)     | `shared` · `module-app` de n'importe quel module                        |
| `global-infra` (Apollo, Prisma) | tout — c'est le point d'assemblage                                      |
| `root` (`index.ts`)             | `global-infra` · `cross-app`                                            |

La règle `{{from.moduleName}}` garantit l'isolation inter-modules sans config par-module. `@iam/app/` ne peut pas importer depuis `@agent/app/` — le module name diffère.

### Ajouter un nouveau bounded context

1. Créer le dossier `src/modules/<ctx>/` avec ses sous-couches `domain/`, `application/`, `infrastructure/`
2. Ajouter **3 lignes** dans `tsconfig.json` :

```json
"@<ctx>/domain/*":  ["./src/modules/<ctx>/domain/*"],
"@<ctx>/app/*":     ["./src/modules/<ctx>/application/*"],
"@<ctx>/infra/*":   ["./src/modules/<ctx>/infrastructure/*"]
```

3. **Aucune modification d'`eslint.config.js`** — les patterns globulaires `src/modules/*/...` couvrent automatiquement le nouveau contexte.

---

## Bounded contexts

| Contexte | Chemin               | État                           |
| -------- | -------------------- | ------------------------------ |
| `iam/`   | `src/modules/iam/`   | `User` — registerAgent         |
| `agent/` | `src/modules/agent/` | `AgentProfile` — registerAgent |

**À venir** : `portefeuille/` · `transaction/` · `comptabilite/` · `academie/` · `commerce/` · `documents/` · `notifications/`

---

## Architecture grpahql

```
src/infrastructure/graphql/
  mutations/
    register-agent/
      register-agent.schema.gql
      register-agent.resolver.ts
  queries/
    get-user-by-id/
      get-user-by-id.schema.gql
      get-user-by-id.resolver.ts
  types/
    user/
      user.type.gql
      user.resolver.ts       ← field resolvers (createdAt, etc.)
  base.gql
  types.generated.ts
  format-error.ts
  index.ts
```
