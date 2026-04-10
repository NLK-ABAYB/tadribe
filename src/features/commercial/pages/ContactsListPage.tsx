import { useState } from 'react'
import { Search, Users, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useContacts } from '../hooks/use-contacts'

export function ContactsListPage() {
  const { data: contacts, isLoading } = useContacts()
  const [search, setSearch] = useState('')

  const filtered = contacts?.filter((c) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Tous les contacts de vos entreprises clientes
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un contact..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !filtered?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun contact</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Les contacts sont créés depuis la fiche entreprise
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Fonction</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Téléphone</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Rôles</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr key={contact.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">
                    {contact.first_name} {contact.last_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {contact.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {contact.job_title ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {contact.phone ?? contact.mobile ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {contact.is_signatory && <Badge variant="outline" className="text-xs">Signataire</Badge>}
                      {contact.is_billing_contact && <Badge variant="outline" className="text-xs">Facturation</Badge>}
                      {contact.is_training_manager && <Badge variant="outline" className="text-xs">Formation</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
