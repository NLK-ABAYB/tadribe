import { useState } from 'react'
import { Search, ExternalLink, Clock, Tag, BookOpen, Scale, Shield, Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface VeilleItem {
  id: string
  title: string
  category: 'reglementation' | 'qualiopi' | 'financement' | 'formation'
  source: string
  date: string
  summary: string
  url?: string
  impact: 'info' | 'action' | 'critique'
  tags: string[]
}

const CATEGORY_CONFIG = {
  reglementation: { icon: Scale, label: 'Réglementation', color: 'text-blue-600' },
  qualiopi: { icon: Shield, label: 'Qualiopi', color: 'text-purple-600' },
  financement: { icon: Landmark, label: 'Financement', color: 'text-green-600' },
  formation: { icon: BookOpen, label: 'Formation pro', color: 'text-orange-600' },
}

const IMPACT_CONFIG = {
  info: { label: 'Information', variant: 'secondary' as const },
  action: { label: 'Action requise', variant: 'warning' as const },
  critique: { label: 'Critique', variant: 'destructive' as const },
}

// Static veille items — these represent the key regulatory references for OF
// In production, these would come from an API or admin-managed content
const VEILLE_ITEMS: VeilleItem[] = [
  {
    id: '1',
    title: 'Référentiel National Qualité (RNQ) - Version en vigueur',
    category: 'qualiopi',
    source: 'Ministère du Travail',
    date: '2025-01-01',
    summary: 'Le RNQ comporte 7 critères et 32 indicateurs. Tous les organismes de formation déclarés doivent s\'y conformer pour obtenir la certification Qualiopi, obligatoire pour accéder aux fonds publics et mutualisés.',
    impact: 'critique',
    tags: ['Qualiopi', 'RNQ', '32 indicateurs', 'certification'],
  },
  {
    id: '2',
    title: 'Loi n°2018-771 - Liberté de choisir son avenir professionnel',
    category: 'reglementation',
    source: 'Légifrance',
    date: '2018-09-05',
    summary: 'Réforme majeure de la formation professionnelle : création de France Compétences, transformation du CPF en euros, certification unique Qualiopi, remplacement des OPCA par les OPCO.',
    impact: 'info',
    tags: ['Loi Avenir Pro', 'CPF', 'OPCO', 'France Compétences'],
  },
  {
    id: '3',
    title: 'Obligations des organismes de formation (art. L.6351-1 et suivants)',
    category: 'reglementation',
    source: 'Code du travail',
    date: '2024-01-01',
    summary: 'Déclaration d\'activité (NDA), bilan pédagogique et financier (BPF) annuel, convention de formation, règlement intérieur, information des stagiaires.',
    impact: 'action',
    tags: ['NDA', 'BPF', 'Convention', 'Déclaration'],
  },
  {
    id: '4',
    title: 'Financement CPF - Reste à charge',
    category: 'financement',
    source: 'France Compétences / Caisse des Dépôts',
    date: '2025-05-01',
    summary: 'Introduction du reste à charge de 100€ pour les titulaires CPF (hors demandeurs d\'emploi). Impact sur les inscriptions et le processus de financement.',
    impact: 'action',
    tags: ['CPF', 'Reste à charge', 'Mon Compte Formation'],
  },
  {
    id: '5',
    title: 'OPCO - Niveaux de prise en charge apprentissage',
    category: 'financement',
    source: 'France Compétences',
    date: '2025-09-01',
    summary: 'Révision annuelle des niveaux de prise en charge (NPEC) pour les contrats d\'apprentissage. Vérifier les montants par certification et OPCO.',
    impact: 'action',
    tags: ['OPCO', 'Apprentissage', 'NPEC', 'CFA'],
  },
  {
    id: '6',
    title: 'RGPD et données des stagiaires',
    category: 'reglementation',
    source: 'CNIL',
    date: '2024-06-01',
    summary: 'Traitement des données personnelles des bénéficiaires : consentement explicite pour les données sensibles (handicap), droit à l\'effacement, registre des traitements, DPO.',
    impact: 'action',
    tags: ['RGPD', 'CNIL', 'Données personnelles', 'Handicap'],
  },
  {
    id: '7',
    title: 'Accessibilité handicap (ind. 26)',
    category: 'qualiopi',
    source: 'RNQ / Agefiph',
    date: '2024-01-01',
    summary: 'Désignation d\'un référent handicap obligatoire, sensibilisation des équipes, partenariats avec les acteurs du handicap (Agefiph, FIPHFP, Cap Emploi). Aménagements raisonnables.',
    impact: 'action',
    tags: ['Handicap', 'Accessibilité', 'Référent', 'Agefiph'],
  },
  {
    id: '8',
    title: 'Bilan Pédagogique et Financier (BPF)',
    category: 'reglementation',
    source: 'DREETS',
    date: '2026-04-30',
    summary: 'Déclaration annuelle obligatoire avant le 30 avril. Recense l\'activité de formation de l\'année N-1 : nombre de stagiaires, heures, CA, types d\'actions.',
    impact: 'critique',
    tags: ['BPF', 'DREETS', 'Déclaration annuelle'],
  },
  {
    id: '9',
    title: 'Sous-traitance en formation (ind. 27)',
    category: 'qualiopi',
    source: 'RNQ',
    date: '2024-01-01',
    summary: 'Conformité des sous-traitants aux exigences du RNQ, convention de sous-traitance, contrôle qualité, responsabilité du donneur d\'ordre.',
    impact: 'info',
    tags: ['Sous-traitance', 'Indicateur 27', 'Convention'],
  },
  {
    id: '10',
    title: 'France Travail - Nouvelles modalités AIF / POEI / POEC',
    category: 'financement',
    source: 'France Travail',
    date: '2025-03-01',
    summary: 'Évolutions des dispositifs de financement France Travail : aide individuelle à la formation (AIF), préparation opérationnelle à l\'emploi (POE). Dématérialisation KAIROS.',
    impact: 'info',
    tags: ['France Travail', 'AIF', 'POEI', 'KAIROS'],
  },
]

export function VeilleReglementairePage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [impactFilter, setImpactFilter] = useState<string>('')

  const filtered = VEILLE_ITEMS.filter((item) => {
    const term = search.toLowerCase()
    const matchesSearch = !term ||
      item.title.toLowerCase().includes(term) ||
      item.summary.toLowerCase().includes(term) ||
      item.tags.some((t) => t.toLowerCase().includes(term))
    const matchesCategory = !categoryFilter || item.category === categoryFilter
    const matchesImpact = !impactFilter || item.impact === impactFilter
    return matchesSearch && matchesCategory && matchesImpact
  })

  const criticalCount = VEILLE_ITEMS.filter((i) => i.impact === 'critique').length
  const actionCount = VEILLE_ITEMS.filter((i) => i.impact === 'action').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Veille réglementaire
        </h1>
        <p className="text-muted-foreground">
          Suivi des évolutions réglementaires, Qualiopi et financements
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200">
          <CardContent className="pt-6 flex items-center gap-4">
            <Badge variant="destructive" className="text-lg px-3 py-1">{criticalCount}</Badge>
            <div>
              <p className="text-sm font-semibold">Points critiques</p>
              <p className="text-xs text-muted-foreground">À surveiller en priorité</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="pt-6 flex items-center gap-4">
            <Badge variant="warning" className="text-lg px-3 py-1">{actionCount}</Badge>
            <div>
              <p className="text-sm font-semibold">Actions requises</p>
              <p className="text-xs text-muted-foreground">À traiter prochainement</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-3 py-1">{VEILLE_ITEMS.length}</Badge>
            <div>
              <p className="text-sm font-semibold">Total des éléments</p>
              <p className="text-xs text-muted-foreground">Base de veille</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher (titre, contenu, tag)..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={impactFilter}
          onChange={(e) => setImpactFilter(e.target.value)}
        >
          <option value="">Tous impacts</option>
          {Object.entries(IMPACT_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const catConfig = CATEGORY_CONFIG[item.category]
          const impactConfig = IMPACT_CONFIG[item.impact]
          const CatIcon = catConfig.icon
          return (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <CatIcon className={`h-5 w-5 mt-0.5 shrink-0 ${catConfig.color}`} />
                    <div>
                      <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                        <span>—</span>
                        <span>{item.source}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={impactConfig.variant}>{impactConfig.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-auto"
                    >
                      Voir la source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Aucun résultat</h3>
            <p className="text-sm text-muted-foreground mt-1">Modifiez vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
