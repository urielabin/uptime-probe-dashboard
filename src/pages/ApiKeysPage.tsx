import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type ApiKeyRow, listApiKeys } from '../lib/api-keys.js'
import { useSession } from '../hooks/useSession.js'
import { GenerateKeyDialog } from '../components/api-keys/GenerateKeyDialog.js'
import { ApiKeyList } from '../components/api-keys/ApiKeyList.js'

export function ApiKeysPage() {
  const { session } = useSession()
  const [keys, setKeys] = useState<ApiKeyRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    listApiKeys()
      .then(setKeys)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!session) return null

  return (
    <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <Link to="/dashboard" className="text-sm text-secondary hover:text-primary">← Monitors</Link>
      <h1 className="text-2xl font-semibold mt-2 mb-8">API keys</h1>

      <div className="mb-8">
        <GenerateKeyDialog userId={session.user.id} onGenerated={refresh} />
      </div>

      {loading ? <p className="text-secondary text-sm">Loading…</p> : <ApiKeyList keys={keys} onRevoked={refresh} />}
    </div>
  )
}
