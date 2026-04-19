import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Loader2, Mail, Phone, Globe, Users, UserPlus } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCompany, useUpdateCompany } from '../hooks/use-companies'
import { useContacts, useCreateContact } from '../hooks/use-contacts'
import { useAuthContext } from '@/features/auth/auth-context'
import { CompanyForm } from '../components/CompanyForm'
import { ContactForm } from '../components/ContactForm'
import { useInviteUser } from '@/features/shared/hooks/use-invite-user'

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuthContext()
  const { data: company, isLoading } = useCompany(id)
  const { data: contacts } = useContacts(id)
  const updateCompany = useUpdateCompany()
  const createContact = useCreateContact()
  const inviteUser = useInviteUser()
  const [editing, setEditing] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [invitingId, setInvitingId] = useState<string | null>(null)

  async function handleInviteContact(contact: { id: string; email: string | null; first_name: string; last_name: string }) {
    if (!contact.email) {
      toast.error('Aucune adresse email renseignée pour ce contact')
      return
    }
    setInvitingId(contact.id)
    try {
      const res = await inviteUser.mutateAsync({
        email: contact.email,
        role: 'entreprise',
        target_id: contact.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
      })
      toast.success(res.already_invited ? 'Contact déjà invité — lien régénéré' : 'Invitation envoyée')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'invitation')
    } finally {
      setInvitingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!company) {
    return <p className="text-center text-muted-foreground py-12">Entreprise non trouvée</p>
  }

  async function handleUpdate(data: Record<string, unknown>) {
    try {
      await updateCompany.mutateAsync({ id: company!.id, ...data } as Parameters<typeof updateCompany.mutateAsync>[0])
      toast.success('Entreprise mise à jour')
      setEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  async function handleCreateContact(data: Record<string, unknown>) {
    if (!profile?.organization_id) return
    try {
      await createContact.mutateAsync({
        ...data,
        organization_id: profile.organization_id,
        company_id: company!.id,
      } as Parameters<typeof createContact.mutateAsync>[0])
      toast.success('Contact ajouté')
      setShowContactForm(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Entreprises', href: '/dashboard/entreprises' }, { label: company.name }]} />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          <div className="flex gap-2 mt-1">
            {company.siret && (
              <Badge variant="outline">SIRET: {company.siret}</Badge>
            )}
            {company.is_client && (
              <Badge variant="secondary">Client</Badge>
            )}
            {company.is_prospect && (
              <Badge variant="outline">Prospect</Badge>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditing(!editing)}>
          {editing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      {editing ? (
        <Card>
          <CardContent className="pt-6">
            <CompanyForm
              defaultValues={company}
              onSubmit={handleUpdate}
              isSubmitting={updateCompany.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {company.email}
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {company.phone}
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {company.website}
                </div>
              )}
              {company.naf_code && <p>Code NAF : {company.naf_code}</p>}
              {company.workforce_size != null && <p>Effectif : {company.workforce_size}</p>}
              {company.idcc && <p>IDCC : {company.idcc}</p>}
              {company.notes && (
                <>
                  <Separator />
                  <p className="text-muted-foreground">{company.notes}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contacts ({contacts?.length ?? 0})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowContactForm(!showContactForm)}>
                <Plus className="mr-1 h-3 w-3" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              {showContactForm && (
                <div className="mb-4 border-b pb-4">
                  <ContactForm
                    onSubmit={handleCreateContact}
                    isSubmitting={createContact.isPending}
                  />
                </div>
              )}
              {contacts?.length ? (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium text-sm">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.job_title && (
                          <p className="text-xs text-muted-foreground">{contact.job_title}</p>
                        )}
                        {contact.email && (
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.contact_type && <Badge variant="outline" className="text-xs">{contact.contact_type}</Badge>}
                        {contact.is_active === false && <Badge variant="outline" className="text-xs">Inactif</Badge>}
                        {contact.user_id ? (
                          <Badge variant="success" className="text-xs">Portail activé</Badge>
                        ) : contact.email ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={invitingId === contact.id}
                            onClick={() => handleInviteContact({
                              id: contact.id,
                              email: contact.email,
                              first_name: contact.first_name,
                              last_name: contact.last_name,
                            })}
                          >
                            {invitingId === contact.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserPlus className="h-3 w-3" />
                            )}
                            <span className="ml-1">Inviter</span>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun contact
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Liens rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link to={`/dashboard/inscriptions?company=${company.id}`}>
              <Button variant="outline" size="sm">Inscriptions</Button>
            </Link>
            <Link to={`/dashboard/factures?company=${company.id}`}>
              <Button variant="outline" size="sm">Factures</Button>
            </Link>
            <Link to={`/dashboard/financements?company=${company.id}`}>
              <Button variant="outline" size="sm">Financements</Button>
            </Link>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  )
}
