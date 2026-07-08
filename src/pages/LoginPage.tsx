import { Link } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm.js'

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <LoginForm />
      <p className="text-sm text-secondary">
        No account? <Link to="/signup" className="text-accent">Sign up</Link>
      </p>
    </div>
  )
}
