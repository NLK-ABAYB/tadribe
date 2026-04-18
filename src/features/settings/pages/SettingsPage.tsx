import { useRef, useState } from 'react'
import { Loader2, Building2, Users, Shield, Save, Upload, Scale, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { USER_ROLES } from '@/lib/constants'
import { useAuthContext } from '@/features/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { useOrganizationSettings, useUpdateOrganization, useTeamMembers, useUpdateProfile } from '../hooks/use-settings'
import type { UserRole } from '@/lib/types/database'

type Settings = { legal_mentions?: string; cgv?: string } | null

function readSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as Settings
}

export function SettingsPage() {
  const { profile, role } = useAuthContext()
  const { data: org, isLoading: orgLoading } = useOrganizationSettings(profile?.organization_id)
  const { data: team } = useTeamMembers(profile?.organization_id)
  const updateOrg = useUpdateOrganization()
  const updateProfile = useUpdateProfile()

  // Organization form state
  const [orgName, setOrgName] = useState('')
  const [orgSiret, setOrgSiret] = useState('')
  const [orgNda, setOrgNda] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgEmail, setOrgEmail] = useState('')
  const [orgWebsite, setOrgWebsite] = useState('')
  const [orgLegalMentions, setOrgLegalMentions] = useState('')
  const [orgCgv, setOrgCgv] = useState('')
  const [orgInitialized, setOrgInitialized] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form when data loads
  if (org && !orgInitialized) {
    setOrgName(org.name ?? '')
    setOrgSiret(org.siret ?? '')
    setOrgNda(org.nda ?? '')
    setOrgPhone(org.phone ?? '')
    setOrgEmail(org.email ?? '')
    setOrgWebsite(org.website ?? '')
    const settings = readSettings(org.settings)
    setOrgLegalMentions(settings?.legal_mentions ?? '')
    setOrgCgv(settings?.cgv ?? '')
    setOrgInitialized(true)
  }

  if (orgLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  async function handleSaveOrg() {
    if (!org) return
    const currentSettings = readSettings(org.settings) ?? {}
    await updateOrg.mutateAsync({
      id: org.id,
      name: orgName,
      siret: orgSiret,
      nda: orgNda || null,
      phone: orgPhone || null,
      email: orgEmail || null,
      website: orgWebsite || null,
      settings: {
        ...currentSettings,
        legal_mentions: orgLegalMentions || undefined,
        cgv: orgCgv || undefined,
      },
    })
    toast.success('Organisation mise à jour')
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !org) return
    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 2 Mo)')
      return
    }
    setUploadingLogo(true)
    try {
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${org.id}/logo-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
      await updateOrg.mutateAsync({ id: org.id, logo_url: urlData.publicUrl })
      toast.success('Logo mis à jour')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload")
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveLogo() {
    if (!org) return
    await updateOrg.mutateAsync({ id: org.id, logo_url: null })
    toast.success('Logo retiré')
  }

  async function handleToggleActive(memberId: string, currentActive: boolean | null) {
    const next = !currentActive
    await updateProfile.mutateAsync({
      id: memberId,
      is_active: next,
    })
    toast.success(currentActive ? 'Utilisateur désactivé' : 'Utilisateur activé')
  }

  async function handleChangeRole(memberId: string, newRole: UserRole) {
    await updateProfile.mutateAsync({
      id: memberId,
      role: newRole,
    })
    toast.success('Rôle modifié')
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Paramètres' }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configuration de l'organisme et gestion de l'équipe</p>
      </div>

      {/* Organization settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations de l'organisme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="flex items-start gap-4 pb-4 border-b">
            <div className="h-20 w-20 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
              {org?.logo_url ? (
                <img src={org.logo_url} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Label>Logo de l'organisme</Label>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG ou SVG. Max 2 Mo. Apparaît sur les devis et factures.
              </p>
              {role.isAdmin && (
                <div className="flex gap-2 mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {org?.logo_url ? 'Remplacer' : 'Téléverser'}
                  </Button>
                  {org?.logo_url && (
                    <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Retirer
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom de l'organisme *</Label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>SIRET *</Label>
              <Input value={orgSiret} onChange={(e) => setOrgSiret(e.target.value)} maxLength={14} />
            </div>
            <div className="space-y-2">
              <Label>Numéro de Déclaration d'Activité (NDA)</Label>
              <Input value={orgNda} onChange={(e) => setOrgNda(e.target.value)} placeholder="11 chiffres" />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} type="tel" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} type="email" />
            </div>
            <div className="space-y-2">
              <Label>Site web</Label>
              <Input value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} />
            </div>
          </div>

          {/* Legal mentions and CGV */}
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm">Mentions légales & CGV</span>
            </div>
            <div className="space-y-2">
              <Label>Mentions légales</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={orgLegalMentions}
                onChange={(e) => setOrgLegalMentions(e.target.value)}
                placeholder="Apparaissent au bas des documents (devis, factures, conventions)"
              />
            </div>
            <div className="space-y-2">
              <Label>Conditions générales de vente (CGV)</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={orgCgv}
                onChange={(e) => setOrgCgv(e.target.value)}
                placeholder="Conditions de paiement, délais de rétractation, modalités de résiliation…"
              />
            </div>
          </div>

          {/* Qualiopi info */}
          {org && (
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Qualiopi :</span>
                {org.qualiopi ? (
                  <Badge variant="success">Certifié</Badge>
                ) : (
                  <Badge variant="outline">Non certifié</Badge>
                )}
              </div>
              {org.qualiopi_valid_until && (
                <span className="text-xs text-muted-foreground">
                  Valable jusqu'au {new Date(org.qualiopi_valid_until).toLocaleDateString('fr-FR')}
                </span>
              )}
              {org.tva_exempt && (
                <Badge variant="secondary">Exonéré TVA</Badge>
              )}
            </div>
          )}

          {role.isAdmin && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveOrg} disabled={updateOrg.isPending || !orgName}>
                {updateOrg.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5" />
            Équipe ({team?.length ?? 0} membre{(team?.length ?? 0) > 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {team && team.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-sm font-medium">Nom</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Rôle</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">Dernier accès</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
                    {role.isAdmin && <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => {
                    const isCurrentUser = member.id === profile?.id
                    return (
                      <tr key={member.id} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {member.first_name} {member.last_name}
                            </span>
                            {isCurrentUser && <Badge variant="outline" className="text-xs">Vous</Badge>}
                          </div>
                          {member.job_title && (
                            <p className="text-xs text-muted-foreground">{member.job_title}</p>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                          {member.email}
                        </td>
                        <td className="px-4 py-2">
                          {role.isAdmin && !isCurrentUser ? (
                            <select
                              className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                              value={member.role}
                              onChange={(e) => handleChangeRole(member.id, e.target.value as UserRole)}
                            >
                              {Object.entries(USER_ROLES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {USER_ROLES[member.role]}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-muted-foreground hidden md:table-cell">
                          {member.last_login_at
                            ? new Date(member.last_login_at).toLocaleDateString('fr-FR')
                            : 'Jamais'}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={member.is_active ? 'success' : 'destructive'} className="text-xs">
                            {member.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        {role.isAdmin && (
                          <td className="px-4 py-2">
                            {!isCurrentUser && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleToggleActive(member.id, member.is_active)}
                              >
                                {member.is_active ? 'Désactiver' : 'Activer'}
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun membre trouvé</p>
          )}
        </CardContent>
      </Card>

      {/* Referent info */}
      {team && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Référents Qualiopi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Référent handicap (ind. 26)</p>
                {(() => {
                  const referent = team.find((m) => m.is_referent_handicap)
                  return referent ? (
                    <p className="text-sm font-medium mt-1">{referent.first_name} {referent.last_name}</p>
                  ) : (
                    <p className="text-sm text-orange-600 mt-1">Non désigné</p>
                  )
                })()}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Référent mobilité</p>
                {(() => {
                  const referent = team.find((m) => m.is_referent_mobilite)
                  return referent ? (
                    <p className="text-sm font-medium mt-1">{referent.first_name} {referent.last_name}</p>
                  ) : (
                    <p className="text-sm text-orange-600 mt-1">Non désigné</p>
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
