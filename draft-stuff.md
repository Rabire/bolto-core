iam/

User — identité, rôle, archivage
Auth Better Auth (sessions, tokens, impersonation)
→ reçoit un event AbonnementActivé depuis commerce/ pour le statut abonnement

agent/

Profile — KYC, RCP, statut juridique, onboarding
CustomerFeedback — avis sur le minisite
Hiérarchie MLM — parentId (nouveau, absent de V1)

portefeuille/

Property + Surface + Advert
Contact + SearchFilters
BonVisite ← agrégat à créer (remplace createVisitSlip + Attachment)

transaction/

Mandate
Compromise
OffreAchat ← agrégat à créer (remplace createPurchaseOffer + Attachment)

comptabilite/

Income — honoraires agence
Commission — commissions agents + MLM 5 niveaux
Intégration Pennylane (à modéliser)

academie/

Lesson + Chapter + Question
UserVideoProgress + ChapterQuestionsAnswers
InPersonSession + InPersonSessionGuest

commerce/

Product + ProductOption
Cart + CartItem + CartItemOption
Order + OrderItem
Abonnements Stripe (stripeCustomerId, subscriptionStatus — migrés depuis User)

documents/

Attachment — e-sign DocuSeal, stockage S3
Génération PDF (bons de visite, offres, compromis...)

notifications/

Aucun modèle en V1 — à construire de zéro
Email, SMS, push

---

Shared

Address — value object dans shared/domain/

---

Deprecated — à ne pas porter dans Burton

Lead, Comment, UserView, Subscriber, Renovation, Partner
LessonType.ENERGY_RENOVATION, IncomeType.RENOVATION, IncomeType.UPGRADE
