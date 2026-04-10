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
  MapPin,
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
          { label: 'Tableau de bord', href: '/', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Mes formations',
        items: [
          { label: 'Sessions', href: '/sessions', icon: CalendarDays },
          { label: 'Apprenants', href: '/beneficiaires', icon: GraduationCap },
        ],
      },
    ]
  }

  if (!isStaff) return []

  return [
    {
      items: [
        { label: 'Tableau de bord', href: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Commercial',
      items: [
        { label: 'Entreprises', href: '/entreprises', icon: Building2 },
        { label: 'Contacts', href: '/contacts', icon: Users },
        { label: 'Pipeline', href: '/pipeline', icon: Target },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        { label: 'Formations', href: '/formations', icon: BookOpen },
      ],
    },
    {
      title: 'Planification',
      items: [
        { label: 'Sessions', href: '/sessions', icon: CalendarDays },
        { label: 'Lieux', href: '/lieux', icon: MapPin },
      ],
    },
    {
      title: 'Stagiaires',
      items: [
        { label: 'Bénéficiaires', href: '/beneficiaires', icon: GraduationCap },
        { label: 'Inscriptions', href: '/inscriptions', icon: ClipboardList },
      ],
    },
    {
      title: 'Équipe',
      items: [
        { label: 'Formateurs', href: '/formateurs', icon: UserCheck },
      ],
    },
    {
      title: 'Financier',
      items: [
        { label: 'Financements', href: '/financements', icon: Wallet },
        { label: 'Factures', href: '/factures', icon: FileText },
      ],
    },
    {
      title: 'Qualité',
      items: [
        { label: 'Évaluations', href: '/evaluations', icon: Star },
        { label: 'Qualiopi', href: '/qualiopi', icon: Shield },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { label: 'Paramètres', href: '/parametres', icon: Settings },
      ],
    },
  ]
}

export function Sidebar() {
  const location = useLocation()
  const { organization, role } = useAuthContext()
  const sections = getNavSections(role.isStaff, role.isFormateur)

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-sidebar">
      {/* Logo / Org name */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          T
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-semibold text-sidebar-foreground">
            {organization?.name ?? 'Tadribe'}
          </span>
          {organization?.nda && (
            <span className="truncate text-xs text-muted-foreground">
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
                {sectionIndex > 0 && <Separator className="my-2" />}
                <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              </>
            )}
            {section.items.map((item) => {
              const isActive =
                item.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
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
