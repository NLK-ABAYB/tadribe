import { Link } from 'react-router-dom'
import {
  BookOpen,
  Users,
  FileText,
  Shield,
  BarChart3,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Catalogue & Formations',
    description: 'Gérez votre offre de formation, programmes pédagogiques et sessions en toute conformité Qualiopi.',
  },
  {
    icon: Users,
    title: 'Gestion des Apprenants',
    description: 'Suivi complet des bénéficiaires, inscriptions, positionnement et parcours individualisés.',
  },
  {
    icon: CalendarDays,
    title: 'Planification & Sessions',
    description: 'Planifiez vos sessions, gérez les formateurs, les lieux et le suivi d\'émargement.',
  },
  {
    icon: FileText,
    title: 'Facturation & Financements',
    description: 'Devis, factures, conventions et suivi des financements CPF, OPCO, France Travail.',
  },
  {
    icon: Shield,
    title: 'Conformité Qualiopi',
    description: 'Tableau de bord qualité couvrant les 32 indicateurs du Référentiel National Qualité.',
  },
  {
    icon: BarChart3,
    title: 'Pilotage & KPIs',
    description: 'Dashboard temps réel : CA, sessions, inscriptions, financements et alertes automatiques.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Marie Dupont',
    role: 'Directrice pédagogique',
    company: 'FormaPro',
    text: 'Tadribe nous a permis de passer notre audit Qualiopi sereinement. Tout est centralisé et accessible.',
    rating: 5,
  },
  {
    name: 'Jean-Luc Martin',
    role: 'Responsable administratif',
    company: 'Institut Avenir',
    text: 'La gestion des financements et la facturation n\'ont jamais été aussi simples. Un gain de temps considérable.',
    rating: 5,
  },
  {
    name: 'Sophie Lefèvre',
    role: 'Formatrice indépendante',
    company: 'SL Formations',
    text: 'L\'interface est intuitive et le portail apprenant est un vrai plus pour mes stagiaires.',
    rating: 5,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A5F] text-white text-sm font-bold">
              T
            </div>
            <span className="text-xl font-bold text-[#1E3A5F]">Tadribe</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white">
                Essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#264a75] to-[#1E3A5F] text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4aDEydjEySDE4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Le CRM conçu pour les{' '}
              <span className="text-emerald-400">organismes de formation</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80 sm:text-xl">
              Pilotez votre activité de formation, assurez votre conformité Qualiopi
              et simplifiez la gestion administrative — tout en un seul outil.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 px-8">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                  Se connecter
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Conforme Qualiopi</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Multi-financements</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> RGPD compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#F8F7F4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A5F] sm:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour gérer votre organisme de formation
              de A à Z, en conformité avec le cadre réglementaire français.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-emerald-200"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A5F] sm:text-4xl">
              Ils nous font confiance
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez ce que nos utilisateurs pensent de Tadribe.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-gray-200 bg-[#F8F7F4] p-8"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-[#1E3A5F]">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role} — {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#1E3A5F] to-[#264a75] text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Prêt à simplifier la gestion de votre organisme ?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Rejoignez les organismes de formation qui ont choisi Tadribe
            pour piloter leur activité en toute sérénité.
          </p>
          <div className="mt-8">
            <Link to="/register">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 px-10">
                Démarrer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-[#1E3A5F] text-white/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white text-sm font-bold">
                  T
                </div>
                <span className="text-lg font-bold text-white">Tadribe</span>
              </div>
              <p className="text-sm text-white/50">
                CRM SaaS pour organismes de formation.
                Conforme Qualiopi.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li>Catalogue</li>
                <li>Facturation</li>
                <li>Qualité Qualiopi</li>
                <li>Portails</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li>Documentation</li>
                <li>Guide Qualiopi</li>
                <li>Veille réglementaire</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li>Mentions légales</li>
                <li>CGU</li>
                <li>Politique de confidentialité</li>
                <li>RGPD</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
            © {new Date().getFullYear()} Tadribe. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
