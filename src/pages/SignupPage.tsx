import { Link } from 'react-router-dom'
import { SignupForm } from '../components/auth/SignupForm.js'

export function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
      <h1 className="text-2xl font-semibold">Sign up</h1>
      <SignupForm />
      <p className="text-sm text-secondary">
        Already have an account? <Link to="/login" className="text-accent">Log in</Link>
      </p>
    </div>
  )
}
