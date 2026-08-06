import MessageList from './components/MessageList'
import TaskList from './components/TaskList'
import IngestForm from './components/IngestForm'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Smart Inbox & Task Automator</h1>
        <p className="text-sm text-gray-500">AI triages your messages, drafts replies, and builds your task list.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          <IngestForm />
          <h2 className="text-lg font-semibold text-gray-800">Inbox</h2>
          <MessageList />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
          <TaskList />
        </section>
      </div>
    </div>
  )
}
