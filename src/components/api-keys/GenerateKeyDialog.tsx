import { useState } from 'react'
import { generateApiKey } from '../../lib/api-keys.js'

export function GenerateKeyDialog({ userId, onGenerated }: { userId: string; onGenerated: () => void }) {
  const [name, setName] = useState('')
  const [rawToken, setRawToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { rawToken: token } = await generateApiKey(userId, name || 'default')
      setRawToken(token)
      onGenerated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate key')
    } finally {
      setSubmitting(false)
    }
  }

  if (rawToken) {
    return (
      <div className="bg-surface border border-accent/50 rounded-xl p-4">
        <p className="text-sm text-secondary mb-2">
          Copy this key now — it won't be shown again. Set it as <code className="text-primary">DASHBOARD_API_KEY</code> for the CLI.
        </p>
        <code data-testid="raw-api-key" className="block bg-bg border border-border rounded-lg px-3 py-2 text-sm text-primary break-all">{rawToken}</code>
        <button
          onClick={() => navigator.clipboard.writeText(rawToken)}
          className="mt-3 text-sm text-accent"
        >
          Copy to clipboard
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleGenerate} className="flex gap-2 items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="key-name" className="text-sm text-secondary">Key name</label>
        <input
          id="key-name"
          type="text"
          placeholder="e.g. production CI"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-accent"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-accent text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"
      >
        {submitting ? 'Generating…' : 'Generate key'}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  )
}
