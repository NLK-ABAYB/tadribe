# CLAUDE.md - Tadribe CRM

## Projet
CRM SaaS multi-tenant pour organismes de formation en France, conforme Qualiopi.

## Stack technique
- **Frontend** : React 19 + TypeScript 6, Vite 8, React Router v7
- **UI** : shadcn/ui + Tailwind CSS 3.4
- **State** : TanStack Query v5 (server), Zustand v5 (client)
- **Forms** : React Hook Form v7 + Zod v3
- **Backend** : Supabase (Auth, PostgreSQL, Storage, Realtime, Edge Functions)
- **Icons** : Lucide React
- **Notifications** : Sonner (toasts)

## Architecture
- Multi-tenant : chaque table a `organization_id`, isolation via RLS
- Feature-based folder structure sous `src/features/`
- 4 helpers RLS (dans le schéma `public`, `SECURITY DEFINER` + `STABLE`) : `public.organization_id()`, `public.user_role()`, `public.is_staff()`, `public.is_admin()`
- Path alias `@/` pointe vers `src/`

## Rôles utilisateurs
| Rôle | Description | Scope |
|------|-------------|-------|
| `admin_of` | Administrateur de l'organisme | Tout voir/modifier dans son org |
| `gestionnaire` | Gestionnaire administratif | Tout voir/modifier sauf paramètres org |
| `commercial` | Responsable commercial | Entreprises, contacts, pipeline, devis |
| `formateur` | Formateur/intervenant | Ses sessions, ses apprenants, émargement |
| `apprenant` / `apprenti` | Stagiaire/apprenti | Son parcours, ses documents, évaluations |
| `entreprise` | Contact entreprise (tuteur, RH) | Ses salariés, factures, suivi |

## Ce qui a été fait

### Phase 1 : Documentation référence (commit ef07c2f)
- 6 documents de référence sur le cadre légal, cycle de vie, Qualiopi (32 indicateurs), financements
- Document compilé : `docs/REFERENCE-CRM-ORGANISMES-FORMATION.md`

### Phase 2 : Architecture (commit 4cf32fd)
- Schéma DB Supabase complet (6 fichiers draft)
- Liste de ~120 fonctionnalités priorisées (P0-P3)
- Architecture composants React (feature-based, ~60 routes)
- Règles RLS complètes pour tous les rôles

### Phase 3 : Migrations Supabase (commit b976203)
- 9 migrations ordonnées (`supabase/migrations/001-009`)
- 14 types ENUM, 30+ tables, 80+ politiques RLS
- Buckets storage (documents, avatars, logos)

### Phase 4 : Code applicatif (en cours)
- [x] Initialisation projet Vite + React 19 + TypeScript 6
- [x] Tailwind CSS + shadcn/ui (button, input, label, card, avatar, dropdown, separator, badge)
- [x] Supabase client + types placeholder (`src/lib/types/database.ts`)
- [x] Module Auth & Rôles
  - AuthProvider (contexte React), useAuth, useRole, useOrganization hooks
  - LoginPage, RegisterPage, ForgotPasswordPage
  - RequireAuth guard (rôles + redirect)
  - Navigation sidebar adaptée au rôle (staff vs formateur)
- [x] Module Clients (entreprises, contacts)
  - CompaniesListPage (recherche, création inline)
  - CompanyDetailPage (fiche, édition, contacts liés)
  - ContactsListPage (table avec rôles signatory/billing/training)
  - CompanyForm + ContactForm (Zod validation, SIRET)
  - Hooks CRUD : useCompanies, useContacts
- [x] Module Sessions de formation
  - SessionsListPage (table avec formation, formateur, lieu, statut)
  - SessionDetailPage (dates, lieu/distanciel, formateur, objectifs, participants)
  - Hook useSession avec relations (formations, trainers, locations)
- [x] Module Pipeline commercial
  - PipelinePage (vue kanban 5 colonnes, déplacement inter-étapes)
  - Hooks CRUD : useOpportunities
- [x] Module Facturation (workflow devis → facture)
  - InvoicesListPage (table avec statuts, montants, paiements)
  - InvoiceDetailPage (workflow visuel, montants, lignes, mentions légales)
  - InvoiceEditPage (création avec lignes, calculs TVA auto)
  - InvoiceForm (lignes dynamiques, totaux temps réel, mentions NDA/TVA)
  - InvoiceWorkflow (stepper visuel: devis → convention → facture → paiement)
  - Hooks CRUD : useInvoices, useInvoiceLines

### Phase 5 : Bloc 1 — Formations, Formateurs, Bénéficiaires, Inscriptions
- [x] Types DB complets (`database.ts`) : Formation, Trainer, Beneficiary, Enrollment, Certification, etc.
- [x] Constants enrichis : ACTION_CATEGORIES, FORMATION_MODALITIES, EVAL_TYPES, QUALIFICATION_LEVELS, FUNDING_STATUSES
- [x] Module Formations (catalogue)
  - FormationsListPage (recherche, filtre catégorie, grille cartes)
  - FormationDetailPage (objectifs ind.1, résultats ind.2, pédagogie ind.6, tarifs)
  - FormationForm (Zod, champs Qualiopi : objectifs, prérequis, accessibilité, CPF)
  - Hooks CRUD : useFormations, useFormation, useCreateFormation, useUpdateFormation, useDeleteFormation
- [x] Module Formateurs
  - TrainersListPage (recherche, cartes avec spécialités, interne/externe)
  - TrainerDetailPage (coordonnées, tarifs, compétences validées ind.21, bio)
  - TrainerForm (identité, spécialités, tarifs, bio)
  - Hooks CRUD : useTrainers, useTrainer, useTrainerCompetencies, useCreateTrainer, useUpdateTrainer
- [x] Module Bénéficiaires
  - BeneficiariesListPage (table avec entreprise, qualification, badges PSH/apprenti/CPF)
  - BeneficiaryDetailPage (coordonnées, situation pro, handicap ind.26 avec RGPD, apprentissage, inscriptions)
  - BeneficiaryForm (identité, entreprise, qualification, handicap conditionnel, apprentissage conditionnel)
  - Hooks CRUD : useBeneficiaries, useBeneficiary, useCreateBeneficiary, useUpdateBeneficiary
- [x] Module Inscriptions
  - EnrollmentsListPage (table avec bénéficiaire, formation, session, statut, filtre statut)
  - EnrollmentDetailPage (workflow stepper 5 étapes, positionnement ind.8, documents ind.9, session info)
  - EnrollmentForm (sélection session + bénéficiaire, statut, type contrat)
  - Hooks CRUD : useEnrollments, useEnrollment, useCreateEnrollment, useUpdateEnrollment
- [x] Routes mises à jour : formations/:id, formateurs/:id, beneficiaires/:id, inscriptions/:id
- [x] Build TypeScript OK

### Phase 6 : Bloc 2 — Documents légaux, Émargement, Certificats, PDF
- [x] @react-pdf/renderer installé pour génération PDF
- [x] Types ajoutés : Certificate, Document (GED)
- [x] Module Émargement (ind. 12)
  - AttendancePage (créneaux par session, présence/absence, signature électronique)
  - SignatureCanvas (composant canvas tactile pour signature)
  - Hooks : useSessionSlots, useAttendances, useEnrollmentAttendances, useMarkAttendance, useSignAttendance, useCreateSessionSlot
  - Bouton "Émargement" ajouté sur SessionDetailPage
- [x] Module Documents
  - ConventionsPage (liste des inscriptions avec entreprise, génération PDF convention)
  - CertificatesPage (certificats de réalisation, génération auto pour inscriptions terminées)
  - Hooks : useCertificates, useCreateCertificate, useDocuments, useCreateDocument
- [x] Templates PDF (react-pdf/renderer)
  - ConventionPDF (convention de formation inter-entreprise, articles L.6353-1/2, mentions légales)
  - CertificatePDF (certificat de réalisation, art. L.6353-1)
  - AttendanceSheetPDF (feuille d'émargement paysage, matin/après-midi, signatures)
- [x] Navigation mise à jour : sections Documents (conventions, certificats) dans la sidebar
- [x] Routes : sessions/:id/emargement, /conventions, /certificats
- [x] Build TypeScript OK

### Phase 7 : Bloc 3 — Financements
- [x] Module Financements complet
  - FundingListPage (table avec KPIs agrégés, filtres type/statut, recherche)
  - FundingDetailPage (workflow stepper 6 étapes, montants, CPF, dates de suivi)
  - FundingForm (tous les types CPF/OPCO/France Travail/AGEFIPH, subrogation, CPF conditionnel)
  - Hooks CRUD : useFundingDossiers, useFundingDossier, useCreateFundingDossier, useUpdateFundingDossier
- [x] Routes : /financements, /financements/:id
- [x] Build TypeScript OK

### Phase 8 : Bloc 4 — Évaluations + Qualiopi
- [x] Module Évaluations
  - EvaluationsListPage (grille cartes, filtre type, recherche, création inline)
  - EvaluationDetailPage (stats réponses/score moyen, questions, table des réponses)
  - Hooks CRUD : useEvaluations, useEvaluation, useEvaluationResponses, useCreateEvaluation, useSubmitResponse
- [x] Module Qualité — Tableau de bord Qualiopi
  - QualiopiDashboardPage (conformité calculée en temps réel sur données CRM)
  - 11 indicateurs couvrant les 7 critères RNQ : information du public (ind.1), résultats (ind.2), conception (ind.6), positionnement (ind.8), documents (ind.9), émargement (ind.12), compétences formateurs (ind.21), accessibilité handicap (ind.26), satisfaction (ind.30), réclamations (ind.31), amélioration continue (ind.32)
  - Statuts conforme/partiel/non conforme avec seuils 80%/40%
- [x] Routes : /evaluations, /evaluations/:id, /qualiopi
- [x] Build TypeScript OK

### Phase 9 : Bloc 5 — Portails externes (apprenant, entreprise)
- [x] PortalLayout (layout responsive avec navbar horizontale, mobile-friendly, déconnexion)
- [x] Portail Apprenant (`/mon-espace`)
  - LearnerDashboardPage (KPIs, formations en cours, liens rapides, table toutes formations)
  - LearnerFormationDetailPage (objectifs, dates, formateur, émargement détaillé)
  - LearnerDocumentsPage (liste documents avec téléchargement)
  - LearnerCertificatesPage (certificats avec téléchargement PDF)
  - LearnerEvaluationsPage (questionnaires à remplir, soumission en ligne)
  - Hooks : useMyBeneficiaryProfile, useMyEnrollments, useMyAttendance, useMyDocuments, useMyCertificates, useMyEvaluations
- [x] Portail Entreprise (`/espace-entreprise`)
  - CompanyDashboardPage (KPIs collaborateurs/formations/factures, formations récentes, factures en attente)
  - CompanyCollaboratorsPage (table salariés avec badges apprenti/salarié)
  - CompanyFormationsPage (table inscriptions avec statuts)
  - CompanyInvoicesPage (résumé HT/payé/dû, table factures)
  - CompanyFundingPage (résumé demandé/accordé, table dossiers)
  - Hooks : useMyCompany, useCompanyBeneficiaries, useCompanyEnrollments, useCompanyInvoices, useCompanyFunding
- [x] Redirections automatiques : apprenants → /mon-espace, entreprises → /espace-entreprise
- [x] Routes protégées par rôle (RequireAuth allowedRoles)
- [x] Build TypeScript OK

### Phase 10 : Bloc 6 — Dashboard KPIs, Veille réglementaire, Paramètres
- [x] Dashboard KPIs temps réel
  - useDashboardStats (agrégation parallèle : entreprises, sessions, inscriptions, factures, formations, formateurs, bénéficiaires, financements)
  - DashboardPage remodelé : 8 cartes KPI cliquables, résumés sessions/inscriptions
  - Liens directs vers chaque module depuis les cartes
- [x] Module Paramètres (/parametres)
  - SettingsPage : informations organisme (SIRET, NDA, contact, Qualiopi), gestion équipe (rôles, activation/désactivation), référents Qualiopi (handicap ind.26, mobilité)
  - Hooks : useOrganizationSettings, useUpdateOrganization, useTeamMembers, useUpdateProfile
  - Édition rôles inline pour admin, toggle activation membres
- [x] Veille réglementaire (/veille)
  - VeilleReglementairePage : base de 10 éléments réglementaires clés (RNQ, Loi Avenir Pro, BPF, CPF, OPCO, RGPD, handicap, sous-traitance, France Travail)
  - Filtres par catégorie (réglementation/qualiopi/financement/formation) et impact (info/action/critique)
  - Recherche texte et tags
- [x] Navigation sidebar mise à jour : "Veille" ajouté dans section Qualité
- [x] Build TypeScript OK

### Phase 11 : Qualité — Code splitting et tests unitaires
- [x] **Code splitting** : `src/routes.tsx` converti en `React.lazy()` pour toutes les pages (auth, admin, portails)
  - Helper `lazyNamed()` pour gérer les exports nommés
  - `<Suspense>` intégré dans `AppLayout` et `PortalLayout` autour de `<Outlet />`
  - `<Suspense>` dédié pour les routes publiques (`/login`, `/register`, `/forgot-password`)
  - Résultat : `index.js` passe de ~2.5 MB à 308 kB (gzip 93 kB), chaque page est un chunk indépendant
  - Le chunk `@react-pdf/renderer` (~1.5 MB) n'est chargé qu'à la visite de `/conventions` ou `/certificats`
- [x] **Vitest** installé (`vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`)
  - `vitest.config.ts` séparé de `vite.config.ts` pour éviter les conflits de types avec `tsc -b`
  - `src/test/setup.ts` : import `@testing-library/jest-dom/vitest`, `cleanup()` après chaque test, polyfills `ResizeObserver` et `matchMedia` pour Radix UI
  - Scripts npm : `test` (run), `test:watch` (watch mode)
- [x] **Tests unitaires** (38 tests, 4 fichiers, 100% verts)
  - `src/lib/utils.test.ts` — helper `cn()` (merge Tailwind + tri)
  - `src/lib/constants.test.ts` — catalogues USER_ROLES, STAFF_ROLES, FUNDING_TYPES, QUALIFICATION_LEVELS, etc.
  - `src/features/invoicing/lib/calculations.test.ts` — `computeInvoiceTotals()` (HT, TVA, TTC, exonération, valeurs nulles, taux négatif) + `formatEuros()`
  - `src/features/quality/pages/VeilleReglementairePage.test.tsx` — rendu, filtrage recherche, état vide, compteurs
- [x] Refactor : extraction de `computeInvoiceTotals` + `formatEuros` dans `src/features/invoicing/lib/calculations.ts` pour rendre la logique de calcul facturation testable hors composant

### Phase 12 : Types Supabase générés + couverture de tests élargie (hooks MSW + composants)
- [x] **Types Supabase générés** : `src/types/supabase.ts` récupéré via `supabase gen types typescript --project-id mcyxxgjnkrmbbqshsykg`
  - `src/lib/types/database.ts` re-exporte désormais `Database` depuis `@/types/supabase` (source canonique)
  - À ce stade de la phase 12, les migrations n'étaient pas encore poussées sur le projet distant ; les hooks continuaient donc à caster via `as unknown as T` en s'appuyant sur les types manuels de `database.ts`. La bascule complète sur les types générés a été réalisée en Phase 13.
- [x] **MSW v2** installé (`msw`) pour intercepter les requêtes PostgREST dans les tests de hooks
  - `src/test/msw-server.ts` : `setupServer()` Node + constantes `SUPABASE_URL` / `SUPABASE_REST`
  - `src/test/setup.ts` : `server.listen({ onUnhandledRequest: 'error' })` + `resetHandlers()` après chaque test + `server.close()` à la fin
  - `src/test/query-client.tsx` : helpers `createTestQueryClient()`, `withQueryClient()`, `renderWithQueryClient()`, `renderHookWithQueryClient()` (retry:false, staleTime:0, gcTime:0)
- [x] **Tests de hooks Supabase avec MSW** (6 fichiers, flux CRUD complet)
  - `src/features/invoicing/hooks/use-invoices.test.ts` — useInvoices (succès+erreur), useInvoice (disabled+fetch par id), useInvoiceLines (filtre invoice_id), useCreateInvoice (insert+erreur 409), useUpdateInvoice (patch par id)
  - `src/features/sessions/hooks/use-sessions.test.ts` — useSessions (relations embed via `select`), useSession (disabled+fetch par id), useCreateSession, useUpdateSession
  - `src/features/commercial/hooks/use-companies.test.ts` — useCompanies (succès+erreur), useCompany (disabled+fetch par id), useCreateCompany, useUpdateCompany, useDeleteCompany (204)
  - `src/features/commercial/hooks/use-contacts.test.ts` — useContacts (sans filtre vs filtre `company_id=eq.xxx`), useCreateContact, useUpdateContact
- [x] **Tests de composants avec hooks mockés** (états : chargement / données / vide / filtre / erreur)
  - `src/features/invoicing/pages/InvoicesListPage.test.tsx` — spinner, état vide, rendu des lignes, filtrage par recherche, état vide après filtre (5 tests)
  - `src/features/sessions/pages/SessionsListPage.test.tsx` — spinner, état vide, rendu avec relations (formation/formateur/lieu/distanciel), filtrage par nom formateur, hint "aucun résultat" (5 tests)
  - `src/features/commercial/pages/CompaniesListPage.test.tsx` — spinner, état vide, cartes avec SIRET/secteur, filtrage, toggle formulaire de création, hint "aucun résultat" (6 tests) — mocks `useAuthContext` + stub `CompanyForm`
- [x] **Résultat : 80 tests verts (11 fichiers)**, build TypeScript OK

### Phase 13 : Bascule complète sur les types Supabase générés (commit 7ee9fde)
- [x] **Migrations SQL appliquées sur le projet Supabase distant** (`npx supabase db push`) — les RLS helpers ont été déplacés du schéma `auth` vers `public` (commit `5a2561d`) pour contourner la restriction de permissions du cloud Supabase
- [x] **Types régénérés** : `src/types/supabase.ts` contient maintenant les 30+ tables réelles (`Database.Tables` n'est plus vide)
- [x] **`createClient<Database>`** activé dans `src/lib/supabase.ts` : chaque appel `.from('table')` est désormais strictement typé
- [x] **`src/lib/types/database.ts`** devient un thin re-export shim :
  - Re-exporte `Database`, `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`, `Json` depuis `@/types/supabase`
  - Expose des aliases lisibles (`Company`, `Session`, `Invoice`, etc.) au-dessus de `Tables<'xxx'>`
  - Plus aucun type écrit à la main
- [x] **17 hooks migrés** — tous les hooks de features utilisent maintenant `Tables<'...'>` / `TablesInsert<'...'>` / `TablesUpdate<'...'>` directement, plus aucun cast `as unknown as T`
- [x] **Nettoyage des colonnes fantômes** détectées par le type checker contre le schéma réel :
  - `CompanyForm` : suppression de `sector`, `size_range`, `convention_collective` → ajout de `siren`, `naf_code`, `workforce_size`, `idcc`
  - `ContactForm` : suppression de `mobile`, `role_in_company`, `is_signatory`, `is_billing_contact`, `is_training_manager` → ajout de `contact_type`, `is_active`
  - `PipelinePage` : `expected_close_date` → `expected_close`
  - Invoicing : `paid_amount` → `amount_paid` (bulk replace sur pages invoicing + portail entreprise)
- [x] **Null-guards systématiques** sur les colonnes nullables du schéma réel :
  - Statuts nullables utilisés comme index de `Record` : ajout de `&& status` (enrollments, funding, sessions, portails)
  - Montants/dates nullables passés à des fonctions non-nullable : `?? 0` ou null-guard (invoicing, portail entreprise)
  - Arrays nullables (`trainer.specialties`, `formation.objectives`) : `(x?.length ?? 0) > 0` ou `x && x.length > 0`
  - `boolean | null` sur `profile.is_active` dans `SettingsPage`
- [x] **`evaluations.questions` est `Json` (et non `Json[]`)** dans le schéma réel :
  - `EvaluationDetailPage`, `EvaluationsListPage` : narrowing via `Array.isArray(evaluation.questions) ? ... : []`
  - `LearnerEvaluationsPage` : bloc JSX enveloppé dans une IIFE pour narrowing local
- [x] **Fixtures de tests mises à jour** pour coller aux `Row` générés :
  - `makeCompany` : passe à `siren`/`naf_code`/`workforce_size`/`idcc`/`is_client`/`is_prospect`
  - `makeContact` : passe à `contact_type`/`is_active`
  - `makeInvoice` : ajout de `payment_schedule: null` (champ requis non-optionnel)
  - `makeInvoiceLine` : ajout de `created_at`
- [x] **Résultat : 80 tests verts, `bun run build` OK sans erreur TypeScript**
- [x] **53 fichiers modifiés, 432 insertions, 946 suppressions** — la dette technique des types manuels est soldée

### Phase 14 : Onboarding + fix auth + couverture tests complète
- [x] **Migration 010** : trigger `handle_new_user()` auto-création profil sur `auth.users` INSERT (organization_id NULL)
- [x] **Migration 011** : RPC `bootstrap_organization` (SECURITY DEFINER) — création atomique organisme + liaison profil + promotion admin_of
- [x] **Migration 012** : policy `profiles_select_self` — corrige le bug RLS `NULL = NULL` qui empêchait l'utilisateur de lire son propre profil quand organization_id est NULL
- [x] **Page d'onboarding** (`/onboarding`) : formulaire RHF+Zod (nom, SIRET 14 chiffres, NDA optionnel, adresse), appelle `bootstrap_organization` RPC
- [x] **Redirect staff sans org** : `AppLayout` redirige vers `/onboarding` si `profile.organization_id` est NULL
- [x] **Guards null-org** : 11 pages avec early-return `if (!profile?.organization_id) return` + hooks élargis à `string | null | undefined`
- [x] **Fix auth flow** : callback `onAuthStateChange` rendu synchrone (`.then()` au lieu de `async/await`) pour ne pas bloquer `signInWithPassword`
- [x] **LoginForm redirect** : `navigate('/')` après sign-in réussi (+ restauration `from` location)
- [x] **Console.log instrumentation** : tags `[auth]`, `[org]`, `[RequireAuth]`, `[AppLayout]`, `[LoginForm]` dans le flux d'auth
- [x] **Tests composants étendus** à tous les modules restants :
  - FormationsListPage (7 tests) — spinner, vide, cartes titre/code/durée/prix, badge CPF, recherche, form, aucun résultat
  - TrainersListPage (7 tests) — spinner, vide, cartes nom/email/TJM/spécialités/interne-externe, recherche nom, recherche spécialité, form, aucun résultat
  - BeneficiariesListPage (7 tests) — spinner, vide, table nom/email/entreprise/qualification/badges PSH+apprenti+CPF, recherche nom, recherche entreprise, form, aucun résultat
  - EnrollmentsListPage (7 tests) — spinner, vide, table bénéficiaire/formation/session/entreprise/statut, recherche nom, recherche formation, form, aucun résultat
  - FundingListPage (7 tests) — spinner, vide, KPIs montants agrégés, table type/bénéficiaire/formation/statut, recherche, form, aucun résultat
  - EvaluationsListPage (7 tests) — spinner, vide, cartes titre/type/formation/questions, badge Inactif, recherche, form inline, aucun résultat
- [x] **Résultat : 122 tests verts (17 fichiers)**, build TypeScript OK

### Ce qui reste à faire
- (tâche tests composants complétée en Phase 14)

## Décisions techniques

1. **Vite plutôt que Next.js** : SaaS interne, pas besoin de SSR/SEO. Vite est plus simple et rapide.
2. **shadcn/ui** : composants copiés dans le projet (pas de dépendance npm), personnalisables, accessibles.
3. **Feature-based structure** : chaque module a ses pages, composants, hooks. Meilleure isolation.
4. **RLS sur toutes les tables** : sécurité au niveau DB, pas seulement au niveau API.
5. **Enums PostgreSQL** : type safety côté DB, généré en TypeScript via `supabase gen types`.
6. **Multi-tenant par organization_id** : un seul schéma DB, isolation par RLS. Scalable et simple.
7. **Database type** : source canonique générée dans `src/types/supabase.ts` (via `supabase gen types typescript --project-id …`) et re-exportée depuis `src/lib/types/database.ts`, qui sert désormais de thin shim au-dessus des types générés (aliases `Company`, `Session`, `Invoice`, etc. au-dessus de `Tables<'xxx'>`). Le client Supabase utilise `createClient<Database>`, les hooks utilisent `Tables<'...'>` / `TablesInsert<'...'>` / `TablesUpdate<'...'>` directement (plus aucun cast `as unknown as T`). Pour régénérer après une nouvelle migration : `npx supabase db push` puis `supabase gen types typescript --project-id … > src/types/supabase.ts`.
8. **Mentions légales auto** : les mentions NDA et TVA sont pré-remplies depuis les infos de l'organisation.

## Points de vigilance

- **Ordre des migrations** : respecter les dépendances FK (001 → 009)
- **RLS helper functions** : doivent être `SECURITY DEFINER` + `STABLE` pour performance
- **TVA** : les OF peuvent être exonérés (attestation fiscale). Le champ `tva_exempt` conditionne la facturation.
- **RGPD** : données handicap nécessitent consentement explicite (`disability_consent`)
- **Qualiopi** : 32 indicateurs à mapper sur les fonctionnalités CRM
- **Financement mixte** : un même dossier peut combiner CPF + OPCO + reste à charge
- **Délai de rétractation** : 14 jours pour B2C (particuliers), pas de délai B2B
- **TypeScript 6** : `baseUrl` est deprecated, utiliser `paths` sans `baseUrl` dans tsconfig

## Commandes utiles

```bash
# Dev
npm run dev              # Lancer le serveur de dev Vite (port 5173)

# Supabase
npx supabase start       # Lancer Supabase local (Docker)
npx supabase db reset    # Reset + replay migrations
npx supabase db push     # Appliquer migrations sur instance distante
npx supabase gen types typescript --project-id mcyxxgjnkrmbbqshsykg > src/types/supabase.ts

# Build
npm run build            # TypeScript check + Vite build
npm run lint             # ESLint
```

## Structure des fichiers

```
tadribe/
├── CLAUDE.md
├── .env.example            # Variables Supabase
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── docs/                   # Documentation référence (6 docs + architecture)
├── supabase/
│   └── migrations/         # 9 fichiers SQL ordonnés (001-009)
└── src/
    ├── main.tsx
    ├── App.tsx             # QueryClient + AuthProvider + RouterProvider
    ├── routes.tsx          # Toutes les routes (public + protected)
    ├── index.css           # Tailwind + CSS variables shadcn
    ├── types/
    │   └── supabase.ts     # Types générés par `supabase gen types` (source canonique)
    ├── lib/
    │   ├── supabase.ts     # Client Supabase (createClient<Database>)
    │   ├── constants.ts    # Labels français pour les enums
    │   ├── utils.ts        # cn() helper
    │   ├── types/
    │   │   └── database.ts # Thin shim : aliases lisibles au-dessus de @/types/supabase
    │   └── hooks/
    │       ├── use-auth.ts
    │       ├── use-role.ts
    │       └── use-organization.ts
    ├── components/
    │   ├── ui/             # shadcn/ui (button, input, card, etc.)
    │   └── layout/
    │       ├── AppLayout.tsx    # Layout admin (sidebar + header)
    │       ├── PortalLayout.tsx # Layout portails (navbar horizontale responsive)
    │       ├── Sidebar.tsx      # Nav adaptée au rôle
    │       └── Header.tsx       # User menu + rôle badge
    └── features/
        ├── auth/            # Login, Register, ForgotPassword, RequireAuth, AuthContext
        ├── dashboard/       # DashboardPage (KPIs par rôle, redirections portails)
        ├── commercial/      # Companies, Contacts, Pipeline (kanban)
        ├── sessions/        # Sessions list + detail (avec relations)
        ├── invoicing/       # Factures, workflow devis→facture, formulaire lignes
        ├── catalogue/       # Formations (liste, détail, CRUD, Qualiopi ind.1/2/6/7)
        ├── trainers/        # Formateurs (profil, compétences ind.21, tarifs)
        ├── beneficiaries/   # Bénéficiaires (fiche, handicap ind.26, apprentissage)
        ├── enrollments/     # Inscriptions (workflow, positionnement ind.8, documents ind.9)
        ├── attendance/      # Émargement (signature canvas, présence ind.12)
        ├── documents/       # Documents légaux (conventions PDF, certificats, GED)
        ├── funding/         # Financements (CPF, OPCO, France Travail, suivi dossiers)
        ├── evaluations/     # Évaluations (questionnaires, satisfaction, insertion)
        ├── quality/         # Tableau de bord Qualiopi (conformité 32 indicateurs)
        ├── portal-learner/  # Portail apprenant (/mon-espace) : parcours, docs, évals
        ├── portal-company/  # Portail entreprise (/espace-entreprise) : collaborateurs, factures
        └── settings/        # Paramètres (organisation, équipe, référents Qualiopi)
```
