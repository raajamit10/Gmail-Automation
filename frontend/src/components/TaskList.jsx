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
    mutationFn: ({ id, completed }) =>
      updateTask(id, { completed }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading tasks...
      </div>
    )
  }

  const pendingTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div className="space-y-4">

      {/* Task Statistics */}
      <div className="grid grid-cols-2 gap-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {pendingTasks.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Completed
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {completedTasks.length}
          </p>
        </div>

      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">

          <div className="text-4xl">
            ✅
          </div>

          <h3 className="mt-3 font-semibold text-slate-800">
            All caught up
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Tasks will automatically appear when AI detects an action item.
          </p>

        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="space-y-3">

          <h3 className="text-sm font-semibold text-slate-500">
            TO DO
          </h3>

          {pendingTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={(completed) =>
                toggleMutation.mutate({
                  id: task.id,
                  completed,
                })
              }
              loading={toggleMutation.isPending}
            />
          ))}

        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">

          <h3 className="text-sm font-semibold text-slate-400">
            COMPLETED
          </h3>

          {completedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={(completed) =>
                toggleMutation.mutate({
                  id: task.id,
                  completed,
                })
              }
              loading={toggleMutation.isPending}
            />
          ))}

        </div>
      )}

    </div>
  )
}


function TaskCard({ task, onToggle, loading }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 transition ${
        task.completed
          ? 'border-slate-200 opacity-60'
          : 'border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >

      <div className="flex gap-3">

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          disabled={loading}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 h-5 w-5 cursor-pointer accent-slate-900"
        />

        <div className="min-w-0 flex-1">

          {/* Task Title */}
          <p
            className={`text-sm font-semibold ${
              task.completed
                ? 'text-slate-400 line-through'
                : 'text-slate-800'
            }`}
          >
            {task.title}
          </p>

          {/* Description */}
          {task.description && (
            <p
              className={`mt-1 text-xs leading-5 ${
                task.completed
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Due Date */}
          <div className="mt-3 flex flex-wrap gap-2">

            {task.due_date ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                📅 Due{' '}
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            ) : (
              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-400">
                No due date
              </span>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}