import type { Resolvers } from "@infra/graphql/types.generated";

type StrictResolvers = Partial<{
  [K in keyof Resolvers]-?: Required<NonNullable<Resolvers[K]>>;
}>;

/**
 * Déclare un resolver GraphQL avec vérification de complétude à la compilation.
 *
 * **Problème** : le type généré `Resolvers` rend tous les field resolvers optionnels (`?`).
 * TypeScript ne se plaint donc pas si on oublie d'implémenter un champ — l'erreur
 * n'apparaît qu'au runtime via Apollo ("Cannot return null for non-nullable field …").
 *
 * **Solution** : `StrictResolvers` est une version mappée de `Resolvers` où :
 * - les clés top-level (`User`, `Mutation`, …) restent optionnelles via `Partial<>` — chaque
 *   fichier resolver ne couvre qu'une partie du schéma ;
 * - mais si une clé est fournie, `Required<NonNullable<Resolvers[K]>>` retire tous les `?`
 *   sur ses champs — oublier `email` dans `User` devient une erreur de compilation.
 *
 * `StrictResolvers` est structurellement un sous-type de `Resolvers` (un champ requis est
 * toujours assignable à un champ optionnel du même type), donc Apollo l'accepte sans cast.
 *
 * @example
 * export const userTypeResolver = defineResolver({
 *   User: {
 *     id: (user) => user.id,
 *     email: (user) => user.email,   // ← erreur TS si commenté
 *     name: (user) => user.name ?? null,
 *     createdAt: (user) => user.createdAt.toISOString(),
 *   },
 * });
 */
export function defineResolver(resolver: StrictResolvers): Resolvers {
  return resolver;
}
