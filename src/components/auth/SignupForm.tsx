import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signUp } from '../../lib/auth.js'

export function SignupForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const data = await signUp(email, password)
      if (data.session) {
        navigate('/dashboard')
      } else {
        setError('Check your email to confirm your account before logging in.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-secondary">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-accent"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-secondary">Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-accent"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-accent text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"
      >
        {submitting ? 'Signing up…' : 'Sign up'}
      </button>
    </form>
  )
}
