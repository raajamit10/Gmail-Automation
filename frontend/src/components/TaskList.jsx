import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, updateTask } from '../api/client'

export default function TaskList() {
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
    refetchInterval: 4000,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }) => updateTask(id, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  if (isLoading) return <p className="text-sm text-gray-400">Loading tasks…</p>

  return (
    <div className="space-y-2">
      {tasks.length === 0 && (
        <p className="text-sm text-gray-400">No tasks yet — they'll auto-appear when a message needs action.</p>
      )}
      {tasks.map((t) => (
        <label
          key={t.id}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >
          <input
            type="checkbox"
            checked={t.completed}
            onChange={(e) => toggleMutation.mutate({ id: t.id, completed: e.target.checked })}
            className="mt-1"
          />
          <div>
            <p className={`text-sm font-medium ${t.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {t.title}
            </p>
            {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
            {t.due_date && (
              <p className="text-xs text-gray-400">Due: {new Date(t.due_date).toLocaleDateString()}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  )
}
