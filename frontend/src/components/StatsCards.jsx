import { useQuery } from '@tanstack/react-query'
import { fetchMessages, fetchTasks } from '../api/client'

export default function StatsCards() {
  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
  })

  const urgent = messages.filter(
    (m) => m.category === 'urgent'
  ).length

  const actionNeeded = messages.filter(
    (m) => m.category === 'action_needed'
  ).length

  const pendingTasks = tasks.filter(
    (t) => !t.completed
  ).length

  const completedTasks = tasks.filter(
    (t) => t.completed
  ).length

  const stats = [
    {
      label: 'Total Messages',
      value: messages.length,
      icon: '✉️',
    },
    {
      label: 'Urgent',
      value: urgent,
      icon: '🔴',
    },
    {
      label: 'Action Needed',
      value: actionNeeded,
      icon: '⚡',
    },
    {
      label: 'Pending Tasks',
      value: pendingTasks,
      icon: '✓',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: '🎯',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">
              {stat.icon}
            </span>

            <span className="text-2xl font-bold text-slate-900">
              {stat.value}
            </span>
          </div>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}