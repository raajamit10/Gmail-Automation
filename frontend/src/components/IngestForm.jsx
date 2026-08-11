import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingestMessage } from "../api/client";

const initialForm = {
  sender: "",
  subject: "",
  body: "",
};

export default function IngestForm() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: ingestMessage,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      setForm(initialForm);
      setError("");
    },

    onError: () => {
      setError(
        "Unable to send the message. Please make sure the backend is running."
      );
    },
  });

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.sender.trim()) {
      setError("Please enter the sender email.");
      return;
    }

    if (!form.body.trim()) {
      setError("Please enter a message.");
      return;
    }

    mutation.mutate({
      sender: form.sender.trim(),
      subject: form.subject.trim(),
      body: form.body.trim(),
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              +
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Add to Inbox
              </h3>

              <p className="text-xs text-slate-500">
                Simulate an incoming email and let AI analyze it
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            AI ready
          </div>

        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5">

        <div className="space-y-4">

          {/* Sender + Subject */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                From
              </label>

              <input
                type="email"
                value={form.sender}
                onChange={(e) =>
                  updateField("sender", e.target.value)
                }
                placeholder="boss@company.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Subject
              </label>

              <input
                type="text"
                value={form.subject}
                onChange={(e) =>
                  updateField("subject", e.target.value)
                }
                placeholder="Project deadline"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

          </div>

          {/* Message */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">
                Message
              </label>

              <span className="text-[11px] text-slate-400">
                AI will summarize this
              </span>
            </div>

            <textarea
              value={form.body}
              onChange={(e) =>
                updateField("body", e.target.value)
              }
              placeholder="Paste or type the incoming message here..."
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <span className="text-sm">⚠️</span>

              <p className="text-xs leading-5 text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {mutation.isSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <span className="text-sm">✓</span>

              <p className="text-xs text-emerald-700">
                Message added. AI is processing it in the background.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>✨</span>

              <span>
                AI will classify, summarize, and detect tasks
              </span>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Analyze Message
                  <span>→</span>
                </span>
              )}
            </button>

          </div>

        </div>
      </form>
    </div>
  );
}