## Contexte du projet : bolto-core

**Domaine métier** : plateforme SaaS pour agents immobiliers indépendants avec réseau MLM (commissions sur 5 niveaux).

**Stack technique** : TypeScript · Bun (runtime et bundler — pas Node, pas npm, pas pnpm) · Apollo Server · GraphQL

**Phase** : démarrage — architecture hexagonale en cours de construction. Premiers modules implémentés : `iam/` (User) et `agent/` (AgentProfile) avec la mutation `registerAgent`.

### Bounded Contexts planifiés

| Contexte         | Responsabilité                                                       |
| ---------------- | -------------------------------------------------------------------- |
| `iam/`           | Identité, authentification (Better Auth), sessions, tokens           |
| `agent/`         | Profil agent, KYC, RCP, statut juridique, onboarding, hiérarchie MLM |
| `portefeuille/`  | Biens immobiliers (Property), contacts, bons de visite               |
| `transaction/`   | Mandats, compromis de vente, offres d'achat                          |
| `comptabilite/`  | Honoraires, commissions MLM (5 niveaux), intégration Pennylane       |
| `academie/`      | Formations, leçons, quiz, sessions présentiel                        |
| `commerce/`      | Produits, panier, commandes, abonnements Stripe                      |
| `documents/`     | Signature électronique (DocuSeal), génération PDF, stockage S3       |
| `notifications/` | Email, SMS, push — à construire de zéro                              |

**Shared kernel** : `shared/domain/value-objects/` contient `Address` (partagé entre contextes).

**Événements inter-contextes** : ex. `commerce/` émet `AbonnementActivé` → `iam/` réagit pour mettre à jour le statut abonnement de l'utilisateur.

---

### Conventions — règles impératives

La documentation complète est dans `documentation/architecture-hexagonale.md`. Résumé des règles clés :

**Structure**
- Un dossier n'est créé que s'il contient **au moins 2 fichiers**
- La command vit dans le **même fichier** que le use-case (pas de fichier `command.ts` séparé)
- Les schémas GraphQL sont nommés d'après le **module** (`iam.schema.gql`), pas l'entité

**Nommage**
- Pas de préfixe `I` sur les interfaces — `UserRepository`, pas `IUserRepository`
- Suffixes stricts : `.entity.ts` · `.vo.ts` · `.repository.port.ts` · `.use-case.ts` · `.resolver.ts` · `.schema.gql` · `.error.ts`
- Tout en **kebab-case**, dossiers au **pluriel** (`value-objects/`, `repositories/`, `errors/`)

**Placement des resolvers**
- Resolver d'une opération **propre à un module** → `src/modules/<ctx>/infrastructure/`
- Resolver d'une opération **cross-contexte** → `src/infrastructure/graphql/`

**Prisma**
- Ne jamais importer depuis `generated/` directement — toujours passer par `src/infrastructure/prisma/client.ts`
- Les repositories reçoivent un `DbClient` en constructeur (accepte `prisma` ou une transaction `tx`)

**Couches**
- `domain/` : zéro import externe, TypeScript vanilla uniquement
- `application/` : importe uniquement depuis `domain/`
- `infrastructure/` : seule couche qui connaît Prisma, GraphQL, Bun

**Resolvers GraphQL — règles impératives**
- Toujours utiliser `defineResolver()` (`src/infrastructure/graphql/define-resolver.ts`) pour déclarer un resolver — jamais typer directement avec `Resolvers`
- `defineResolver` force TypeScript à vérifier que **tous les champs** du type GraphQL sont explicitement résolus ; un champ oublié est une erreur de compilation, pas une erreur runtime
- Ne pas s'appuyer sur le default resolver d'Apollo (`parent[fieldName]`) — toujours mapper explicitement chaque champ depuis le DTO correspondant
- Le DTO parent est défini via `mappers` dans `codegen.ts` (ex. `User → UserDto`) ; après tout changement de schéma, relancer `bun run codegen`
- `createdAt` est un `Date` dans les DTOs et doit être converti en `string` avec `.toISOString()` dans le resolver (le schéma expose `String!`, pas le scalar `Date`)

**Commentaires**
- Par défaut : aucun commentaire
- Commenter uniquement quand le **pourquoi** est non-évident (contrainte cachée, invariant subtil, contournement)
- Ne jamais paraphraser ce que le nom de la fonction ou les types expriment déjà
