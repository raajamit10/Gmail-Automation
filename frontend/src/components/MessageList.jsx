import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMessages, approveDraft } from '../api/client'

const categoryStyles = {
  urgent: 'bg-red-50 text-red-600 border-red-200',
  action_needed: 'bg-amber-50 text-amber-600 border-amber-200',
  fyi: 'bg-blue-50 text-blue-600 border-blue-200',
  spam: 'bg-gray-100 text-gray-500 border-gray-200',
  unclassified: 'bg-gray-100 text-gray-400 border-gray-200',
}

export default function MessageList() {
  const queryClient = useQueryClient()

  const [selectedMessage, setSelectedMessage] = useState(null)
  const [draft, setDraft] = useState('')

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
    refetchInterval: 4000,
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, draft_reply }) =>
      approveDraft(id, draft_reply),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages'],
      })

      setSelectedMessage(null)
    },
  })

  const openReply = (message) => {
    setSelectedMessage(message)
    setDraft(message.draft_reply || '')
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <div className="text-4xl mb-3">📭</div>

        <h3 className="font-semibold text-slate-800">
          No messages yet
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Ingest a message to see AI triage in action.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">
                  {m.sender?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {m.sender}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {m.subject || '(no subject)'}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                  categoryStyles[m.category] ||
                  categoryStyles.unclassified
                }`}
              >
                ● {m.category?.replace('_', ' ')}
              </span>
            </div>

            {/* Subject */}
            <h2 className="mt-6 text-lg font-semibold text-slate-900">
              {m.subject || 'No subject'}
            </h2>

            {/* AI Summary */}
            {m.summary && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-5">
                <div className="mb-2 text-sm font-medium text-slate-500">
                  ✨ AI SUMMARY
                </div>

                <p className="text-sm leading-7 text-slate-700">
                  {m.summary}
                </p>
              </div>
            )}

            {/* Processing */}
            {!m.processed && (
              <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-600">
                🤖 AI is processing this message...
              </div>
            )}

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between">
              <button
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
                onClick={() => alert(m.body)}
              >
                View message
              </button>

              {m.draft_reply && (
                <button
                  onClick={() => openReply(m)}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  ✨ View AI Reply
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AI Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  ✨ AI Draft Reply
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Reply to {selectedMessage.sender}
                </p>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Draft reply
              </label>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                You can edit the AI-generated response before approving it.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 p-6">
              <button
                onClick={() => setSelectedMessage(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  approveMutation.mutate({
                    id: selectedMessage.id,
                    draft_reply: draft,
                  })
                }
                disabled={approveMutation.isPending || !draft.trim()}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {approveMutation.isPending
                  ? 'Saving...'
                  : '✓ Approve & Save'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}