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
- 4 helpers RLS : `auth.organization_id()`, `auth.user_role()`, `auth.is_staff()`, `auth.is_admin()`
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

### Ce qui reste à faire
- [ ] Module Évaluations (questionnaires, satisfaction, certificats)
- [ ] Module Qualité (réclamations ind.31, amélioration ind.32, veille ind.23-25, Qualiopi)
- [ ] Module Paramètres (organisation, équipe, sous-traitants ind.27)
- [ ] Portail apprenant (layout dédié, parcours, documents, évaluations)
- [ ] Portail entreprise (layout dédié, salariés, factures)
- [ ] Remplacer types placeholder par `supabase gen types typescript`

## Décisions techniques

1. **Vite plutôt que Next.js** : SaaS interne, pas besoin de SSR/SEO. Vite est plus simple et rapide.
2. **shadcn/ui** : composants copiés dans le projet (pas de dépendance npm), personnalisables, accessibles.
3. **Feature-based structure** : chaque module a ses pages, composants, hooks. Meilleure isolation.
4. **RLS sur toutes les tables** : sécurité au niveau DB, pas seulement au niveau API.
5. **Enums PostgreSQL** : type safety côté DB, généré en TypeScript via `supabase gen types`.
6. **Multi-tenant par organization_id** : un seul schéma DB, isolation par RLS. Scalable et simple.
7. **Database type placeholder** : type `Database` vide pour l'instant, hooks cast via `as unknown as T`. Sera remplacé par les types générés Supabase.
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
npx supabase gen types typescript --local > src/lib/types/database.ts

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
    ├── lib/
    │   ├── supabase.ts     # Client Supabase
    │   ├── constants.ts    # Labels français pour les enums
    │   ├── utils.ts        # cn() helper
    │   ├── types/
    │   │   └── database.ts # Types DB (placeholder, à régénérer)
    │   └── hooks/
    │       ├── use-auth.ts
    │       ├── use-role.ts
    │       └── use-organization.ts
    ├── components/
    │   ├── ui/             # shadcn/ui (button, input, card, etc.)
    │   └── layout/
    │       ├── AppLayout.tsx
    │       ├── Sidebar.tsx  # Nav adaptée au rôle
    │       └── Header.tsx   # User menu + rôle badge
    └── features/
        ├── auth/            # Login, Register, ForgotPassword, RequireAuth, AuthContext
        ├── dashboard/       # DashboardPage (KPIs par rôle)
        ├── commercial/      # Companies, Contacts, Pipeline (kanban)
        ├── sessions/        # Sessions list + detail (avec relations)
        ├── invoicing/       # Factures, workflow devis→facture, formulaire lignes
        ├── catalogue/       # Formations (liste, détail, CRUD, Qualiopi ind.1/2/6/7)
        ├── trainers/        # Formateurs (profil, compétences ind.21, tarifs)
        ├── beneficiaries/   # Bénéficiaires (fiche, handicap ind.26, apprentissage)
        ├── enrollments/     # Inscriptions (workflow, positionnement ind.8, documents ind.9)
        ├── attendance/      # Émargement (signature canvas, présence ind.12)
        ├── documents/       # Documents légaux (conventions PDF, certificats, GED)
        └── funding/         # Financements (CPF, OPCO, France Travail, suivi dossiers)
```
