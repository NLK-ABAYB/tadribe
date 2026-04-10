# Architecture des composants React

**Stack technique :**
- **Framework** : React 18+ avec TypeScript
- **Routing** : React Router v6 (ou TanStack Router)
- **State** : TanStack Query (React Query) pour le server state + Zustand pour le client state
- **UI** : shadcn/ui + Tailwind CSS
- **Formulaires** : React Hook Form + Zod
- **PDF** : @react-pdf/renderer
- **Backend** : Supabase (Auth, Database, Storage, Realtime, Edge Functions)

---

## Arborescence des fichiers

```
src/
|-- main.tsx                        # Point d'entree
|-- App.tsx                         # Router principal
|-- routes.tsx                      # Definition des routes
|
|-- lib/
|   |-- supabase.ts                 # Client Supabase
|   |-- constants.ts                # Constantes (enums, config)
|   |-- utils.ts                    # Utilitaires generaux
|   |-- types/
|   |   |-- database.ts             # Types generes depuis Supabase (supabase gen types)
|   |   |-- index.ts
|   |-- hooks/
|       |-- use-auth.ts             # Hook authentification
|       |-- use-organization.ts     # Hook organisation courante
|       |-- use-role.ts             # Hook verification des roles
|
|-- components/
|   |-- ui/                         # shadcn/ui (button, input, card, dialog, table, etc.)
|   |-- layout/
|   |   |-- AppLayout.tsx           # Layout principal (sidebar + header + content)
|   |   |-- Sidebar.tsx             # Navigation laterale
|   |   |-- Header.tsx              # Barre superieure (user, notifs, org)
|   |   |-- PublicLayout.tsx        # Layout pages publiques (login, catalogue public)
|   |-- shared/
|       |-- DataTable.tsx           # Table de donnees generique (tri, filtres, pagination)
|       |-- KanbanBoard.tsx         # Vue kanban generique (pipeline, reclamations)
|       |-- Calendar.tsx            # Vue calendaire (sessions, planning)
|       |-- StatsCard.tsx           # Carte de statistique (KPI)
|       |-- FileUpload.tsx          # Upload de fichiers (Supabase Storage)
|       |-- PDFViewer.tsx           # Apercu de documents PDF
|       |-- SignaturePad.tsx        # Signature electronique (emargement)
|       |-- RichTextEditor.tsx      # Editeur de texte riche
|       |-- SearchCombobox.tsx      # Recherche avec autocompletion
|       |-- StatusBadge.tsx         # Badge de statut colore
|       |-- ConfirmDialog.tsx       # Dialogue de confirmation
|       |-- EmptyState.tsx          # Etat vide avec CTA
|       |-- NotificationBell.tsx    # Cloche de notifications
|
|-- features/
|   |-- auth/
|   |   |-- pages/
|   |   |   |-- LoginPage.tsx
|   |   |   |-- RegisterPage.tsx
|   |   |   |-- ForgotPasswordPage.tsx
|   |   |-- components/
|   |   |   |-- LoginForm.tsx
|   |   |   |-- RegisterForm.tsx
|   |   |   |-- OrgSetupForm.tsx    # Configuration initiale de l'OF
|   |   |-- hooks/
|   |       |-- use-login.ts
|   |       |-- use-register.ts
|   |
|   |-- dashboard/
|   |   |-- pages/
|   |   |   |-- DashboardPage.tsx   # Tableau de bord principal
|   |   |-- components/
|   |       |-- KPIGrid.tsx         # Grille de KPIs (CA, sessions, inscriptions, satisfaction)
|   |       |-- UpcomingSessions.tsx # Prochaines sessions
|   |       |-- RecentActivity.tsx  # Activite recente
|   |       |-- AlertsPanel.tsx     # Alertes (echeances, absences, relances)
|   |       |-- FundingOverview.tsx  # Repartition des financements
|   |
|   |-- commercial/
|   |   |-- pages/
|   |   |   |-- CompaniesListPage.tsx
|   |   |   |-- CompanyDetailPage.tsx
|   |   |   |-- ContactsListPage.tsx
|   |   |   |-- ContactDetailPage.tsx
|   |   |   |-- PipelinePage.tsx    # Pipeline kanban
|   |   |   |-- OpportunityDetailPage.tsx
|   |   |-- components/
|   |   |   |-- CompanyForm.tsx
|   |   |   |-- ContactForm.tsx
|   |   |   |-- OpportunityForm.tsx
|   |   |   |-- InteractionTimeline.tsx
|   |   |   |-- OpportunityKanban.tsx
|   |   |   |-- QuoteGenerator.tsx  # Generateur de devis
|   |   |-- hooks/
|   |       |-- use-companies.ts
|   |       |-- use-contacts.ts
|   |       |-- use-opportunities.ts
|   |
|   |-- catalogue/
|   |   |-- pages/
|   |   |   |-- FormationsListPage.tsx
|   |   |   |-- FormationDetailPage.tsx
|   |   |   |-- FormationEditPage.tsx
|   |   |   |-- CertificationsPage.tsx
|   |   |   |-- ResourcesPage.tsx
|   |   |-- components/
|   |   |   |-- FormationForm.tsx   # Formulaire avec tous les champs Qualiopi
|   |   |   |-- ProgramEditor.tsx   # Editeur de programme (modules, sequences)
|   |   |   |-- ObjectivesEditor.tsx # Editeur d'objectifs operationnels
|   |   |   |-- CertificationPicker.tsx
|   |   |   |-- CertificationMapping.tsx  # Matrice correspondance (ind. 7)
|   |   |   |-- ResultsIndicators.tsx     # Indicateurs de resultats (ind. 2)
|   |   |   |-- FormationCard.tsx
|   |   |   |-- ResourceUpload.tsx
|   |   |-- hooks/
|   |       |-- use-formations.ts
|   |       |-- use-certifications.ts
|   |
|   |-- sessions/
|   |   |-- pages/
|   |   |   |-- SessionsListPage.tsx
|   |   |   |-- SessionDetailPage.tsx
|   |   |   |-- SessionEditPage.tsx
|   |   |   |-- SessionCalendarPage.tsx
|   |   |   |-- LocationsPage.tsx
|   |   |-- components/
|   |   |   |-- SessionForm.tsx
|   |   |   |-- SessionCalendar.tsx
|   |   |   |-- SlotEditor.tsx      # Gestion des creneaux horaires
|   |   |   |-- ParticipantsList.tsx # Liste des inscrits a une session
|   |   |   |-- TrainerAssignment.tsx
|   |   |   |-- LocationForm.tsx
|   |   |   |-- LocationPicker.tsx
|   |   |-- hooks/
|   |       |-- use-sessions.ts
|   |       |-- use-locations.ts
|   |
|   |-- beneficiaries/
|   |   |-- pages/
|   |   |   |-- BeneficiariesListPage.tsx
|   |   |   |-- BeneficiaryDetailPage.tsx
|   |   |   |-- BeneficiaryEditPage.tsx
|   |   |-- components/
|   |   |   |-- BeneficiaryForm.tsx
|   |   |   |-- NeedsAnalysisForm.tsx    # Analyse des besoins (ind. 4)
|   |   |   |-- PositioningForm.tsx      # Positionnement (ind. 8)
|   |   |   |-- EnrollmentHistory.tsx    # Historique des formations
|   |   |   |-- AdaptationsPanel.tsx     # Adaptations individuelles (ind. 10)
|   |   |   |-- DisabilityConsent.tsx    # Consentement RGPD handicap (ind. 26)
|   |   |-- hooks/
|   |       |-- use-beneficiaries.ts
|   |
|   |-- enrollments/
|   |   |-- pages/
|   |   |   |-- EnrollmentsListPage.tsx
|   |   |   |-- EnrollmentDetailPage.tsx
|   |   |-- components/
|   |   |   |-- EnrollmentForm.tsx
|   |   |   |-- EnrollmentWorkflow.tsx   # Stepper du workflow d'inscription
|   |   |   |-- DocumentChecklist.tsx    # Checklist docs transmis (ind. 9)
|   |   |   |-- ConventionGenerator.tsx  # Generation convention/contrat
|   |   |   |-- RetractionTimer.tsx      # Compte a rebours retractation B2C
|   |   |-- hooks/
|   |       |-- use-enrollments.ts
|   |
|   |-- attendance/
|   |   |-- pages/
|   |   |   |-- AttendancePage.tsx       # Page d'emargement par session
|   |   |   |-- AttendanceReportPage.tsx
|   |   |-- components/
|   |   |   |-- AttendanceSheet.tsx      # Feuille d'emargement interactive
|   |   |   |-- SignatureCapture.tsx     # Capture de signature
|   |   |   |-- AbsenceAlert.tsx        # Alerte d'absence
|   |   |   |-- AttendanceSummary.tsx    # Resume assiduite par session
|   |   |   |-- AttendanceExportPDF.tsx
|   |   |-- hooks/
|   |       |-- use-attendance.ts
|   |
|   |-- funding/
|   |   |-- pages/
|   |   |   |-- FundingListPage.tsx
|   |   |   |-- FundingDetailPage.tsx
|   |   |   |-- FundingEditPage.tsx
|   |   |-- components/
|   |   |   |-- FundingForm.tsx
|   |   |   |-- FundingWorkflow.tsx      # Stepper du workflow financement
|   |   |   |-- FundingTypePicker.tsx    # Selection du type de financement
|   |   |   |-- SubrogationToggle.tsx
|   |   |   |-- FundingDashboard.tsx     # Repartition par type
|   |   |   |-- DeadlineAlerts.tsx       # Alertes delais depot
|   |   |-- hooks/
|   |       |-- use-funding.ts
|   |
|   |-- invoicing/
|   |   |-- pages/
|   |   |   |-- InvoicesListPage.tsx
|   |   |   |-- InvoiceDetailPage.tsx
|   |   |   |-- InvoiceEditPage.tsx
|   |   |   |-- PaymentsPage.tsx
|   |   |-- components/
|   |   |   |-- InvoiceForm.tsx
|   |   |   |-- InvoiceLineEditor.tsx
|   |   |   |-- InvoicePDF.tsx          # Generation PDF
|   |   |   |-- PaymentForm.tsx
|   |   |   |-- ReminderWorkflow.tsx    # Relances automatiques
|   |   |   |-- CertificateGenerator.tsx # Certificat de realisation
|   |   |   |-- RevenueChart.tsx        # Graphique CA
|   |   |-- hooks/
|   |       |-- use-invoices.ts
|   |       |-- use-payments.ts
|   |
|   |-- evaluations/
|   |   |-- pages/
|   |   |   |-- EvaluationsListPage.tsx
|   |   |   |-- EvaluationBuilderPage.tsx  # Constructeur de questionnaire
|   |   |   |-- EvaluationResponsePage.tsx # Page de reponse (stagiaire)
|   |   |   |-- EvaluationResultsPage.tsx
|   |   |-- components/
|   |   |   |-- QuestionnaireBuilder.tsx # Drag & drop questions
|   |   |   |-- QuestionnaireRenderer.tsx # Affichage du questionnaire
|   |   |   |-- SatisfactionChart.tsx   # Graphiques satisfaction
|   |   |   |-- ResultsSummary.tsx
|   |   |   |-- CertificateForm.tsx     # Attestation de fin de formation
|   |   |-- hooks/
|   |       |-- use-evaluations.ts
|   |
|   |-- trainers/
|   |   |-- pages/
|   |   |   |-- TrainersListPage.tsx
|   |   |   |-- TrainerDetailPage.tsx
|   |   |   |-- TrainerEditPage.tsx
|   |   |-- components/
|   |   |   |-- TrainerForm.tsx
|   |   |   |-- CompetencyMatrix.tsx    # Matrice competences/formations (ind. 21)
|   |   |   |-- TrainerSchedule.tsx     # Planning du formateur
|   |   |   |-- CVUpdateAlert.tsx       # Alerte MAJ annuelle (ind. 21)
|   |   |-- hooks/
|   |       |-- use-trainers.ts
|   |
|   |-- quality/
|   |   |-- pages/
|   |   |   |-- ComplaintsListPage.tsx
|   |   |   |-- ComplaintDetailPage.tsx
|   |   |   |-- ImprovementPlanPage.tsx
|   |   |   |-- WatchJournalPage.tsx
|   |   |   |-- QualityReviewPage.tsx
|   |   |   |-- QualiopiAuditPage.tsx
|   |   |-- components/
|   |   |   |-- ComplaintForm.tsx
|   |   |   |-- ComplaintKanban.tsx      # Kanban des reclamations
|   |   |   |-- ImprovementActionForm.tsx
|   |   |   |-- ImprovementTable.tsx
|   |   |   |-- WatchEntryForm.tsx
|   |   |   |-- QualityDashboard.tsx     # Tableau de bord qualite
|   |   |   |-- QualiopiChecklist.tsx    # Checklist 32 indicateurs
|   |   |   |-- QualiopiProgressBar.tsx  # Progression conformite
|   |   |-- hooks/
|   |       |-- use-complaints.ts
|   |       |-- use-improvements.ts
|   |       |-- use-watch.ts
|   |
|   |-- settings/
|       |-- pages/
|       |   |-- OrganizationSettingsPage.tsx
|       |   |-- TeamPage.tsx           # Gestion equipe
|       |   |-- RolesPage.tsx
|       |   |-- HandicapSettingsPage.tsx # Referent handicap (ind. 26)
|       |   |-- SubcontractorsPage.tsx  # Sous-traitants (ind. 27)
|       |   |-- StaffTrainingPage.tsx   # Formation equipe (ind. 22)
|       |-- components/
|           |-- OrgForm.tsx
|           |-- TeamMemberForm.tsx
|           |-- InviteForm.tsx
|           |-- SubcontractorForm.tsx
|           |-- StaffTrainingForm.tsx
|           |-- InterviewForm.tsx       # Entretiens professionnels
```

---

## Routes

```tsx
// routes.tsx
const routes = [
  // -- Public --
  { path: '/login',           element: <LoginPage /> },
  { path: '/register',        element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // -- App (authentifie, layout principal) --
  { path: '/', element: <AppLayout />, children: [
    { index: true,                    element: <DashboardPage /> },

    // Commercial
    { path: 'entreprises',            element: <CompaniesListPage /> },
    { path: 'entreprises/:id',        element: <CompanyDetailPage /> },
    { path: 'contacts',              element: <ContactsListPage /> },
    { path: 'contacts/:id',          element: <ContactDetailPage /> },
    { path: 'pipeline',              element: <PipelinePage /> },
    { path: 'pipeline/:id',          element: <OpportunityDetailPage /> },

    // Catalogue
    { path: 'formations',            element: <FormationsListPage /> },
    { path: 'formations/new',        element: <FormationEditPage /> },
    { path: 'formations/:id',        element: <FormationDetailPage /> },
    { path: 'formations/:id/edit',   element: <FormationEditPage /> },
    { path: 'certifications',        element: <CertificationsPage /> },
    { path: 'ressources',            element: <ResourcesPage /> },

    // Sessions
    { path: 'sessions',              element: <SessionsListPage /> },
    { path: 'sessions/calendrier',   element: <SessionCalendarPage /> },
    { path: 'sessions/new',          element: <SessionEditPage /> },
    { path: 'sessions/:id',          element: <SessionDetailPage /> },
    { path: 'sessions/:id/edit',     element: <SessionEditPage /> },
    { path: 'sessions/:id/emargement', element: <AttendancePage /> },
    { path: 'lieux',                 element: <LocationsPage /> },

    // Beneficiaires
    { path: 'beneficiaires',         element: <BeneficiariesListPage /> },
    { path: 'beneficiaires/new',     element: <BeneficiaryEditPage /> },
    { path: 'beneficiaires/:id',     element: <BeneficiaryDetailPage /> },
    { path: 'beneficiaires/:id/edit', element: <BeneficiaryEditPage /> },

    // Inscriptions
    { path: 'inscriptions',          element: <EnrollmentsListPage /> },
    { path: 'inscriptions/:id',      element: <EnrollmentDetailPage /> },

    // Formateurs
    { path: 'formateurs',            element: <TrainersListPage /> },
    { path: 'formateurs/:id',        element: <TrainerDetailPage /> },
    { path: 'formateurs/:id/edit',   element: <TrainerEditPage /> },

    // Financements
    { path: 'financements',          element: <FundingListPage /> },
    { path: 'financements/new',      element: <FundingEditPage /> },
    { path: 'financements/:id',      element: <FundingDetailPage /> },

    // Facturation
    { path: 'factures',              element: <InvoicesListPage /> },
    { path: 'factures/new',          element: <InvoiceEditPage /> },
    { path: 'factures/:id',          element: <InvoiceDetailPage /> },
    { path: 'paiements',             element: <PaymentsPage /> },

    // Evaluations
    { path: 'evaluations',           element: <EvaluationsListPage /> },
    { path: 'evaluations/builder',   element: <EvaluationBuilderPage /> },
    { path: 'evaluations/:id/results', element: <EvaluationResultsPage /> },

    // Qualite
    { path: 'reclamations',          element: <ComplaintsListPage /> },
    { path: 'reclamations/:id',      element: <ComplaintDetailPage /> },
    { path: 'amelioration',          element: <ImprovementPlanPage /> },
    { path: 'veille',                element: <WatchJournalPage /> },
    { path: 'revues-qualite',        element: <QualityReviewPage /> },
    { path: 'qualiopi',              element: <QualiopiAuditPage /> },

    // Parametres
    { path: 'parametres',            element: <OrganizationSettingsPage /> },
    { path: 'parametres/equipe',     element: <TeamPage /> },
    { path: 'parametres/handicap',   element: <HandicapSettingsPage /> },
    { path: 'parametres/sous-traitants', element: <SubcontractorsPage /> },
    { path: 'parametres/competences', element: <StaffTrainingPage /> },
  ]},

  // -- Portail apprenant (layout simplifie) --
  { path: '/apprenant', element: <LearnerLayout />, children: [
    { index: true,                    element: <LearnerDashboard /> },
    { path: 'formations',            element: <LearnerFormations /> },
    { path: 'documents',             element: <LearnerDocuments /> },
    { path: 'evaluations/:id',       element: <EvaluationResponsePage /> },
  ]},

  // -- Portail entreprise (layout simplifie) --
  { path: '/entreprise', element: <CompanyLayout />, children: [
    { index: true,                    element: <CompanyDashboard /> },
    { path: 'salaries',              element: <CompanyEmployees /> },
    { path: 'formations',            element: <CompanyFormations /> },
    { path: 'factures',              element: <CompanyInvoices /> },
  ]},
];
```

---

## Navigation sidebar (admin_of / gestionnaire)

```
Dashboard
---
Commercial
  Entreprises
  Contacts
  Pipeline
---
Catalogue
  Formations
  Certifications
  Ressources
---
Planification
  Sessions
  Calendrier
  Lieux
---
Stagiaires
  Beneficiaires
  Inscriptions
---
Formateurs
---
Financements
---
Facturation
  Factures
  Paiements
---
Evaluations
---
Qualite
  Reclamations
  Plan d'amelioration
  Veille
  Revues qualite
  Audit Qualiopi
---
Parametres
  Organisation
  Equipe
  Handicap
  Sous-traitants
  Competences equipe
```
