import { useState } from "react";

import MessageList from "./components/MessageList";
import TaskList from "./components/TaskList";
import IngestForm from "./components/IngestForm";
import StatsCards from "./components/StatsCards";
import { useQueryClient } from "@tanstack/react-query";

import { syncGmail } from "./api/client";

export default function App() {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();
  const handleSyncGmail = async () => {
  try {
    setSyncing(true);

    const result = await syncGmail();

    console.log("Gmail sync:", result);

    // Refresh inbox and tasks
    await queryClient.invalidateQueries({
      queryKey: ["messages"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["tasks"],
    });

  } catch (error) {
    console.error("Gmail sync failed:", error);

    alert(
      "Failed to sync Gmail. Make sure the backend is running."
    );
  } finally {
    setSyncing(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Logo / Brand */}
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg text-white shadow-sm">
                ✉️
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  MailMind
                </h1>

                <p className="text-xs text-slate-500">
                  AI-powered inbox automation
                </p>
              </div>

            </div>


            {/* Header Actions */}
            <div className="flex items-center gap-2">

              {/* Sync Gmail */}
              <button
                onClick={handleSyncGmail}
                disabled={syncing}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {syncing ? "Syncing Gmail..." : "↻ Sync Gmail"}
              </button>


              {/* AI Status */}
              <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                AI Online

              </span>


              {/* Gemini */}
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 sm:block">
                Gemini
              </span>

            </div>

          </div>

        </div>
      </header>


      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Hero */}
        <section className="mb-8">

          <p className="text-sm font-medium text-slate-500">
            Hello Amit 👋
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Good Evening!
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Inbox
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Let AI manage your emails, summarize important information,
            detect tasks, and draft replies automatically.
          </p>

        </section>


        {/* ================= STATS ================= */}
        <section className="mb-8">
          <StatsCards />
        </section>


        {/* ================= DASHBOARD ================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">


          {/* ================= LEFT COLUMN ================= */}
          <section className="min-w-0 space-y-6 lg:col-span-2">


            {/* Manual Message */}
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


              {/* Live indicator */}
              <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                Live updates

              </div>

            </div>


            {/* Messages */}
            <MessageList />

          </section>


          {/* ================= RIGHT COLUMN ================= */}
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


            {/* ================= AI CARD ================= */}
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


      {/* ================= FOOTER ================= */}
      <footer className="mx-auto max-w-7xl px-6 pb-8">

        <div className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">

          MailMind · AI-powered productivity

        </div>

      </footer>

    </div>
  );
}