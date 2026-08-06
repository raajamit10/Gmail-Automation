import { useQuery } from '@tanstack/react-query'
import { fetchMessages } from '../api/client'

const categoryStyles = {
  urgent: 'bg-red-100 text-red-700',
  action_needed: 'bg-amber-100 text-amber-700',
  fyi: 'bg-blue-100 text-blue-700',
  spam: 'bg-gray-100 text-gray-500',
  unclassified: 'bg-gray-100 text-gray-400',
}

export default function MessageList() {
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
    refetchInterval: 4000, // poll every 4s to feel "live"
  })

  if (isLoading) return <p className="text-sm text-gray-400">Loading messages…</p>

  return (
    <div className="space-y-3">
      {messages.length === 0 && (
        <p className="text-sm text-gray-400">No messages yet. Ingest one to see the AI triage in action.</p>
      )}
      {messages.map((m) => (
        <div key={m.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-800">{m.sender}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryStyles[m.category]}`}>
              {m.category.replace('_', ' ')}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{m.subject || '(no subject)'}</p>
          {m.summary && <p className="mt-2 text-sm text-gray-700">{m.summary}</p>}
          {!m.processed && <p className="mt-2 text-xs italic text-gray-400">Processing…</p>}
          {m.draft_reply && (
            <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
              <span className="mb-1 block text-xs font-semibold uppercase text-gray-400">Draft reply</span>
              {m.draft_reply}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
