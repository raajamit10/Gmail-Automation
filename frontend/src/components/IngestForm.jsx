import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ingestMessage } from '../api/client'

export default function IngestForm() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ sender: '', subject: '', body: '' })

  const mutation = useMutation({
    mutationFn: ingestMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setForm({ sender: '', subject: '', body: '' })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.sender || !form.body) return
    mutation.mutate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700">Simulate an incoming message</h3>
      <input
        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        placeholder="From (e.g. boss@company.com)"
        value={form.sender}
        onChange={(e) => setForm({ ...form, sender: e.target.value })}
      />
      <input
        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        placeholder="Subject"
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
      />
      <textarea
        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        placeholder="Message body"
        rows={3}
        value={form.body}
        onChange={(e) => setForm({ ...form, body: e.target.value })}
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Sending…' : 'Ingest & Triage'}
      </button>
    </form>
  )
}
