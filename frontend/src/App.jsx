import MessageList from "./components/MessageList";
import TaskList from "./components/TaskList";
import IngestForm from "./components/IngestForm";
import StatsCards from "./components/StatsCards";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg text-white shadow-sm">
                ✦
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Smart Inbox
                </h1>

                <p className="text-xs text-slate-500">
                  AI-powered message management
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                AI Online
              </span>

              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 sm:block">
                Gemini
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero */}
        <section className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            Good to see you 👋
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Your inbox, simplified.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Let AI classify incoming messages, summarize important
            information, draft replies, and automatically create tasks
            for you.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-8">
          <StatsCards />
        </section>

        {/* Dashboard */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <section className="min-w-0 space-y-6 lg:col-span-2">
            {/* Ingest */}
            <IngestForm />

            {/* Inbox Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Inbox
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  AI-processed incoming messages
                </p>
              </div>

              <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Live updates
              </div>
            </div>

            {/* Messages */}
            <MessageList />
          </section>

          {/* Right Column */}
          <aside className="min-w-0 space-y-6">
            {/* Tasks Header */}
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Tasks
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Automatically created from your messages
              </p>
            </div>

            {/* Tasks */}
            <TaskList />

            {/* AI Information */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  ✨
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    AI Assistant
                  </p>

                  <p className="text-xs text-slate-400">
                    Working in the background
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Message classification
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Automatic summaries
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Task detection
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Reply drafting
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 pb-8">
        <div className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          Smart Inbox & Task Automator · AI-powered productivity
        </div>
      </footer>
    </div>
  );
}