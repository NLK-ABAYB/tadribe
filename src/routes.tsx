import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, FileText, Award, CheckCircle2,
  Users, Wallet, GraduationCap, Loader2,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { RequireAuth } from '@/features/auth/components/RequireAuth'

// Lazy loader helper for named exports
function lazyNamed<T extends string>(
  loader: () => Promise<Record<T, React.ComponentType>>,
  name: T,
) {
  return lazy(() =>
    loader().then((mod) => ({ default: mod[name] })),
  )
}

// Auth pages (public)
const LoginPage = lazyNamed(() => import('@/features/auth/pages/LoginPage'), 'LoginPage')
const RegisterPage = lazyNamed(() => import('@/features/auth/pages/RegisterPage'), 'RegisterPage')
const ForgotPasswordPage = lazyNamed(() => import('@/features/auth/pages/ForgotPasswordPage'), 'ForgotPasswordPage')

// Dashboard
const DashboardPage = lazyNamed(() => import('@/features/dashboard/pages/DashboardPage'), 'DashboardPage')

// Commercial
const CompaniesListPage = lazyNamed(() => import('@/features/commercial/pages/CompaniesListPage'), 'CompaniesListPage')
const CompanyDetailPage = lazyNamed(() => import('@/features/commercial/pages/CompanyDetailPage'), 'CompanyDetailPage')
const ContactsListPage = lazyNamed(() => import('@/features/commercial/pages/ContactsListPage'), 'ContactsListPage')
const PipelinePage = lazyNamed(() => import('@/features/commercial/pages/PipelinePage'), 'PipelinePage')

// Sessions
const SessionsListPage = lazyNamed(() => import('@/features/sessions/pages/SessionsListPage'), 'SessionsListPage')
const SessionDetailPage = lazyNamed(() => import('@/features/sessions/pages/SessionDetailPage'), 'SessionDetailPage')

// Invoicing
const InvoicesListPage = lazyNamed(() => import('@/features/invoicing/pages/InvoicesListPage'), 'InvoicesListPage')
const InvoiceDetailPage = lazyNamed(() => import('@/features/invoicing/pages/InvoiceDetailPage'), 'InvoiceDetailPage')
const InvoiceEditPage = lazyNamed(() => import('@/features/invoicing/pages/InvoiceEditPage'), 'InvoiceEditPage')

// Catalogue (Formations)
const FormationsListPage = lazyNamed(() => import('@/features/catalogue/pages/FormationsListPage'), 'FormationsListPage')
const FormationDetailPage = lazyNamed(() => import('@/features/catalogue/pages/FormationDetailPage'), 'FormationDetailPage')

// Formateurs
const TrainersListPage = lazyNamed(() => import('@/features/trainers/pages/TrainersListPage'), 'TrainersListPage')
const TrainerDetailPage = lazyNamed(() => import('@/features/trainers/pages/TrainerDetailPage'), 'TrainerDetailPage')

// Bénéficiaires
const BeneficiariesListPage = lazyNamed(() => import('@/features/beneficiaries/pages/BeneficiariesListPage'), 'BeneficiariesListPage')
const BeneficiaryDetailPage = lazyNamed(() => import('@/features/beneficiaries/pages/BeneficiaryDetailPage'), 'BeneficiaryDetailPage')

// Inscriptions
const EnrollmentsListPage = lazyNamed(() => import('@/features/enrollments/pages/EnrollmentsListPage'), 'EnrollmentsListPage')
const EnrollmentDetailPage = lazyNamed(() => import('@/features/enrollments/pages/EnrollmentDetailPage'), 'EnrollmentDetailPage')

// Émargement
const AttendancePage = lazyNamed(() => import('@/features/attendance/pages/AttendancePage'), 'AttendancePage')

// Documents
const ConventionsPage = lazyNamed(() => import('@/features/documents/pages/ConventionsPage'), 'ConventionsPage')
const CertificatesPage = lazyNamed(() => import('@/features/documents/pages/CertificatesPage'), 'CertificatesPage')

// Financements
const FundingListPage = lazyNamed(() => import('@/features/funding/pages/FundingListPage'), 'FundingListPage')
const FundingDetailPage = lazyNamed(() => import('@/features/funding/pages/FundingDetailPage'), 'FundingDetailPage')

// Évaluations
const EvaluationsListPage = lazyNamed(() => import('@/features/evaluations/pages/EvaluationsListPage'), 'EvaluationsListPage')
const EvaluationDetailPage = lazyNamed(() => import('@/features/evaluations/pages/EvaluationDetailPage'), 'EvaluationDetailPage')

// Qualité
const QualiopiDashboardPage = lazyNamed(() => import('@/features/quality/pages/QualiopiDashboardPage'), 'QualiopiDashboardPage')
const VeilleReglementairePage = lazyNamed(() => import('@/features/quality/pages/VeilleReglementairePage'), 'VeilleReglementairePage')

// Paramètres
const SettingsPage = lazyNamed(() => import('@/features/settings/pages/SettingsPage'), 'SettingsPage')

// Portail Apprenant
const LearnerDashboardPage = lazyNamed(() => import('@/features/portal-learner/pages/LearnerDashboardPage'), 'LearnerDashboardPage')
const LearnerFormationDetailPage = lazyNamed(() => import('@/features/portal-learner/pages/LearnerFormationDetailPage'), 'LearnerFormationDetailPage')
const LearnerDocumentsPage = lazyNamed(() => import('@/features/portal-learner/pages/LearnerDocumentsPage'), 'LearnerDocumentsPage')
const LearnerCertificatesPage = lazyNamed(() => import('@/features/portal-learner/pages/LearnerCertificatesPage'), 'LearnerCertificatesPage')
const LearnerEvaluationsPage = lazyNamed(() => import('@/features/portal-learner/pages/LearnerEvaluationsPage'), 'LearnerEvaluationsPage')

// Portail Entreprise
const CompanyDashboardPage = lazyNamed(() => import('@/features/portal-company/pages/CompanyDashboardPage'), 'CompanyDashboardPage')
const CompanyCollaboratorsPage = lazyNamed(() => import('@/features/portal-company/pages/CompanyCollaboratorsPage'), 'CompanyCollaboratorsPage')
const CompanyFormationsPage = lazyNamed(() => import('@/features/portal-company/pages/CompanyFormationsPage'), 'CompanyFormationsPage')
const CompanyInvoicesPage = lazyNamed(() => import('@/features/portal-company/pages/CompanyInvoicesPage'), 'CompanyInvoicesPage')
const CompanyFundingPage = lazyNamed(() => import('@/features/portal-company/pages/CompanyFundingPage'), 'CompanyFundingPage')

function PublicFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function publicElement(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PublicFallback />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: publicElement(LoginPage) },
  { path: '/register', element: publicElement(RegisterPage) },
  { path: '/forgot-password', element: publicElement(ForgotPasswordPage) },

  // Protected routes
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },

      // Commercial
      { path: 'entreprises', element: <CompaniesListPage /> },
      { path: 'entreprises/:id', element: <CompanyDetailPage /> },
      { path: 'contacts', element: <ContactsListPage /> },
      { path: 'pipeline', element: <PipelinePage /> },

      // Sessions
      { path: 'sessions', element: <SessionsListPage /> },
      { path: 'sessions/:id', element: <SessionDetailPage /> },

      // Invoicing
      { path: 'factures', element: <InvoicesListPage /> },
      { path: 'factures/new', element: <InvoiceEditPage /> },
      { path: 'factures/:id', element: <InvoiceDetailPage /> },

      // Catalogue (Formations)
      { path: 'formations', element: <FormationsListPage /> },
      { path: 'formations/:id', element: <FormationDetailPage /> },

      // Formateurs
      { path: 'formateurs', element: <TrainersListPage /> },
      { path: 'formateurs/:id', element: <TrainerDetailPage /> },

      // Bénéficiaires
      { path: 'beneficiaires', element: <BeneficiariesListPage /> },
      { path: 'beneficiaires/:id', element: <BeneficiaryDetailPage /> },

      // Inscriptions
      { path: 'inscriptions', element: <EnrollmentsListPage /> },
      { path: 'inscriptions/:id', element: <EnrollmentDetailPage /> },

      // Émargement
      { path: 'sessions/:id/emargement', element: <AttendancePage /> },

      // Documents
      { path: 'conventions', element: <ConventionsPage /> },
      { path: 'certificats', element: <CertificatesPage /> },

      // Financements
      { path: 'financements', element: <FundingListPage /> },
      { path: 'financements/:id', element: <FundingDetailPage /> },

      // Évaluations
      { path: 'evaluations', element: <EvaluationsListPage /> },
      { path: 'evaluations/:id', element: <EvaluationDetailPage /> },

      // Qualité
      { path: 'qualiopi', element: <QualiopiDashboardPage /> },

      // Veille réglementaire
      { path: 'veille', element: <VeilleReglementairePage /> },

      // Paramètres
      { path: 'parametres', element: <SettingsPage /> },

      // Placeholders for future modules
      { path: 'lieux', element: <PlaceholderPage title="Lieux" /> },
      { path: 'paiements', element: <PlaceholderPage title="Paiements" /> },
    ],
  },

  // Portail Apprenant (apprenant / apprenti)
  {
    path: '/mon-espace',
    element: (
      <RequireAuth allowedRoles={['apprenant', 'apprenti']}>
        <PortalLayout
          title="Espace Apprenant"
          accentColor="bg-blue-600"
          navItems={[
            { label: 'Tableau de bord', href: '/mon-espace', icon: LayoutDashboard },
            { label: 'Mes formations', href: '/mon-espace/formations', icon: BookOpen },
            { label: 'Documents', href: '/mon-espace/documents', icon: FileText },
            { label: 'Certificats', href: '/mon-espace/certificats', icon: Award },
            { label: 'Évaluations', href: '/mon-espace/evaluations', icon: CheckCircle2 },
          ]}
        />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <LearnerDashboardPage /> },
      { path: 'formations', element: <LearnerDashboardPage /> },
      { path: 'formations/:id', element: <LearnerFormationDetailPage /> },
      { path: 'documents', element: <LearnerDocumentsPage /> },
      { path: 'certificats', element: <LearnerCertificatesPage /> },
      { path: 'evaluations', element: <LearnerEvaluationsPage /> },
    ],
  },

  // Portail Entreprise
  {
    path: '/espace-entreprise',
    element: (
      <RequireAuth allowedRoles={['entreprise']}>
        <PortalLayout
          title="Espace Entreprise"
          accentColor="bg-emerald-600"
          navItems={[
            { label: 'Tableau de bord', href: '/espace-entreprise', icon: LayoutDashboard },
            { label: 'Collaborateurs', href: '/espace-entreprise/collaborateurs', icon: Users },
            { label: 'Formations', href: '/espace-entreprise/formations', icon: GraduationCap },
            { label: 'Factures', href: '/espace-entreprise/factures', icon: FileText },
            { label: 'Financements', href: '/espace-entreprise/financements', icon: Wallet },
          ]}
        />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <CompanyDashboardPage /> },
      { path: 'collaborateurs', element: <CompanyCollaboratorsPage /> },
      { path: 'formations', element: <CompanyFormationsPage /> },
      { path: 'factures', element: <CompanyInvoicesPage /> },
      { path: 'financements', element: <CompanyFundingPage /> },
    ],
  },

  // Catch all
  { path: '*', element: <Navigate to="/" replace /> },
])

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">Module en cours de développement</p>
    </div>
  )
}
