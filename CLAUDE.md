## Contexte du projet : bolto-core

**Domaine métier** : plateforme SaaS pour agents immobiliers indépendants avec réseau MLM (commissions sur 5 niveaux).

**Stack technique** : TypeScript · Bun (runtime et bundler — pas Node, pas npm, pas pnpm) · Apollo Server · GraphQL

**Phase** : démarrage — l'architecture hexagonale est entièrement à construire. Le projet est actuellement un serveur Apollo vide avec des données factices (`books`).

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
