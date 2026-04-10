import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RegisterForm } from '../components/RegisterForm'

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Créer votre compte</CardTitle>
          <CardDescription>
            Inscrivez votre organisme de formation sur Tadribe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
