import { createBrowserRouter, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, FileText, Award, CheckCircle2,
  Users, Wallet, GraduationCap,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { RequireAuth } from '@/features/auth/components/RequireAuth'

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'

// Dashboard
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

// Commercial
import { CompaniesListPage } from '@/features/commercial/pages/CompaniesListPage'
import { CompanyDetailPage } from '@/features/commercial/pages/CompanyDetailPage'
import { ContactsListPage } from '@/features/commercial/pages/ContactsListPage'
import { PipelinePage } from '@/features/commercial/pages/PipelinePage'

// Sessions
import { SessionsListPage } from '@/features/sessions/pages/SessionsListPage'
import { SessionDetailPage } from '@/features/sessions/pages/SessionDetailPage'

// Invoicing
import { InvoicesListPage } from '@/features/invoicing/pages/InvoicesListPage'
import { InvoiceDetailPage } from '@/features/invoicing/pages/InvoiceDetailPage'
import { InvoiceEditPage } from '@/features/invoicing/pages/InvoiceEditPage'

// Catalogue (Formations)
import { FormationsListPage } from '@/features/catalogue/pages/FormationsListPage'
import { FormationDetailPage } from '@/features/catalogue/pages/FormationDetailPage'

// Formateurs
import { TrainersListPage } from '@/features/trainers/pages/TrainersListPage'
import { TrainerDetailPage } from '@/features/trainers/pages/TrainerDetailPage'

// Bénéficiaires
import { BeneficiariesListPage } from '@/features/beneficiaries/pages/BeneficiariesListPage'
import { BeneficiaryDetailPage } from '@/features/beneficiaries/pages/BeneficiaryDetailPage'

// Inscriptions
import { EnrollmentsListPage } from '@/features/enrollments/pages/EnrollmentsListPage'
import { EnrollmentDetailPage } from '@/features/enrollments/pages/EnrollmentDetailPage'

// Émargement
import { AttendancePage } from '@/features/attendance/pages/AttendancePage'

// Documents
import { ConventionsPage } from '@/features/documents/pages/ConventionsPage'
import { CertificatesPage } from '@/features/documents/pages/CertificatesPage'

// Financements
import { FundingListPage } from '@/features/funding/pages/FundingListPage'
import { FundingDetailPage } from '@/features/funding/pages/FundingDetailPage'

// Évaluations
import { EvaluationsListPage } from '@/features/evaluations/pages/EvaluationsListPage'
import { EvaluationDetailPage } from '@/features/evaluations/pages/EvaluationDetailPage'

// Qualité
import { QualiopiDashboardPage } from '@/features/quality/pages/QualiopiDashboardPage'

// Portail Apprenant
import { LearnerDashboardPage } from '@/features/portal-learner/pages/LearnerDashboardPage'
import { LearnerFormationDetailPage } from '@/features/portal-learner/pages/LearnerFormationDetailPage'
import { LearnerDocumentsPage } from '@/features/portal-learner/pages/LearnerDocumentsPage'
import { LearnerCertificatesPage } from '@/features/portal-learner/pages/LearnerCertificatesPage'
import { LearnerEvaluationsPage } from '@/features/portal-learner/pages/LearnerEvaluationsPage'

// Portail Entreprise
import { CompanyDashboardPage } from '@/features/portal-company/pages/CompanyDashboardPage'
import { CompanyCollaboratorsPage } from '@/features/portal-company/pages/CompanyCollaboratorsPage'
import { CompanyFormationsPage } from '@/features/portal-company/pages/CompanyFormationsPage'
import { CompanyInvoicesPage } from '@/features/portal-company/pages/CompanyInvoicesPage'
import { CompanyFundingPage } from '@/features/portal-company/pages/CompanyFundingPage'

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

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

      // Placeholders for future modules
      { path: 'lieux', element: <PlaceholderPage title="Lieux" /> },
      { path: 'paiements', element: <PlaceholderPage title="Paiements" /> },
      { path: 'parametres', element: <PlaceholderPage title="Paramètres" /> },
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
