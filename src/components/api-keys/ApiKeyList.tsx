import type { ApiKeyRow } from '../../lib/api-keys.js'
import { revokeApiKey } from '../../lib/api-keys.js'

export function ApiKeyList({ keys, onRevoked }: { keys: ApiKeyRow[]; onRevoked: () => void }) {
  if (keys.length === 0) {
    return <p className="text-secondary text-sm">No API keys yet.</p>
  }

  async function handleRevoke(id: string) {
    await revokeApiKey(id)
    onRevoked()
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-secondary border-b border-border">
          <th className="pb-2 pr-4">Name</th>
          <th className="pb-2 pr-4">Prefix</th>
          <th className="pb-2 pr-4">Created</th>
          <th className="pb-2 pr-4">Last used</th>
          <th className="pb-2 pr-4">Status</th>
          <th className="pb-2" />
        </tr>
      </thead>
      <tbody>
        {keys.map((key) => (
          <tr key={key.id} className="border-b border-border/50">
            <td className="py-2 pr-4">{key.name}</td>
            <td className="py-2 pr-4 text-secondary">{key.key_prefix}…</td>
            <td className="py-2 pr-4 text-secondary">{new Date(key.created_at).toLocaleDateString()}</td>
            <td className="py-2 pr-4 text-secondary">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'never'}</td>
            <td className="py-2 pr-4">
              {key.revoked_at ? <span className="text-red-400">revoked</span> : <span className="text-green-400">active</span>}
            </td>
            <td className="py-2">
              {!key.revoked_at && (
                <button onClick={() => handleRevoke(key.id)} className="text-secondary hover:text-red-400">
                  Revoke
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
