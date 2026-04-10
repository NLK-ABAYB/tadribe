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

      // Placeholders for future modules
      { path: 'formations', element: <PlaceholderPage title="Formations" /> },
      { path: 'lieux', element: <PlaceholderPage title="Lieux" /> },
      { path: 'beneficiaires', element: <PlaceholderPage title="Bénéficiaires" /> },
      { path: 'inscriptions', element: <PlaceholderPage title="Inscriptions" /> },
      { path: 'formateurs', element: <PlaceholderPage title="Formateurs" /> },
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
