import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  BookOpen,
  CalendarDays,
  GraduationCap,
  ClipboardList,
  UserCheck,
  Wallet,
  FileText,
  Star,
  Shield,
  Settings,
  Award,
  PenLine,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/features/auth/auth-context'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  title?: string
  items: NavItem[]
}

function getNavSections(isStaff: boolean, isFormateur: boolean): NavSection[] {
  if (isFormateur) {
    return [
      {
        items: [
          { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Mes formations',
        items: [
          { label: 'Sessions', href: '/dashboard/sessions', icon: CalendarDays },
          { label: 'Apprenants', href: '/dashboard/beneficiaires', icon: GraduationCap },
        ],
      },
    ]
  }

  if (!isStaff) return []

  return [
    {
      items: [
        { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Commercial',
      items: [
        { label: 'Entreprises', href: '/dashboard/entreprises', icon: Building2 },
        { label: 'Contacts', href: '/dashboard/contacts', icon: Users },
        { label: 'Pipeline', href: '/dashboard/pipeline', icon: Target },
      ],
    },
    {
      title: 'Formation',
      items: [
        { label: 'Catalogue', href: '/dashboard/formations', icon: BookOpen },
        { label: 'Sessions', href: '/dashboard/sessions', icon: CalendarDays },
        { label: 'Formateurs', href: '/dashboard/formateurs', icon: UserCheck },
        { label: 'Bénéficiaires', href: '/dashboard/beneficiaires', icon: GraduationCap },
        { label: 'Inscriptions', href: '/dashboard/inscriptions', icon: ClipboardList },
      ],
    },
    {
      title: 'Facturation',
      items: [
        { label: 'Factures', href: '/dashboard/factures', icon: FileText },
        { label: 'Financements', href: '/dashboard/financements', icon: Wallet },
        { label: 'Conventions', href: '/dashboard/conventions', icon: PenLine },
        { label: 'Certificats', href: '/dashboard/certificats', icon: Award },
      ],
    },
    {
      title: 'Qualité',
      items: [
        { label: 'Évaluations', href: '/dashboard/evaluations', icon: Star },
        { label: 'Qualiopi', href: '/dashboard/qualiopi', icon: Shield },
        { label: 'Veille', href: '/dashboard/veille', icon: Eye },
      ],
    },
    {
      title: 'Paramètres',
      items: [
        { label: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
      ],
    },
  ]
}

export function Sidebar() {
  const location = useLocation()
  const { organization, role } = useAuthContext()
  const sections = getNavSections(role.isStaff, role.isFormateur)

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo / Org name */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-sm">
          T
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-semibold">
            {organization?.name ?? 'Tadribe'}
          </span>
          {organization?.nda && (
            <span className="truncate text-xs text-white/50">
              NDA: {organization.nda}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <>
                {sectionIndex > 0 && <Separator className="my-3 bg-white/10" />}
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  {section.title}
                </p>
              </>
            )}
            {section.items.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-white font-medium'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
