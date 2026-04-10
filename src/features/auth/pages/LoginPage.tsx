import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Tadribe</CardTitle>
          <CardDescription>
            Connectez-vous à votre espace de gestion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Créer un organisme
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
