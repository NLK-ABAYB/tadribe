import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
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

      // Placeholders for future modules
      { path: 'lieux', element: <PlaceholderPage title="Lieux" /> },
      { path: 'financements', element: <PlaceholderPage title="Financements" /> },
      { path: 'paiements', element: <PlaceholderPage title="Paiements" /> },
      { path: 'evaluations', element: <PlaceholderPage title="Évaluations" /> },
      { path: 'qualiopi', element: <PlaceholderPage title="Qualiopi" /> },
      { path: 'parametres', element: <PlaceholderPage title="Paramètres" /> },
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
