import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        Page introuvable
      </p>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/">
          <Button>Retour à l'accueil</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline">Tableau de bord</Button>
        </Link>
      </div>
    </div>
  )
}
