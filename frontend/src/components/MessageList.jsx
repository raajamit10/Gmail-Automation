import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchMessages,
  approveDraft,
} from "../api/client";


const categoryStyles = {
  urgent:
    "bg-red-50 text-red-600 border-red-200",

  action_needed:
    "bg-amber-50 text-amber-600 border-amber-200",

  fyi:
    "bg-blue-50 text-blue-600 border-blue-200",

  spam:
    "bg-gray-100 text-gray-500 border-gray-200",

  unclassified:
    "bg-gray-100 text-gray-400 border-gray-200",
};


export default function MessageList() {
  const queryClient = useQueryClient();

  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const [draft, setDraft] = useState("");

  const [showBody, setShowBody] = useState(null);


  // ============================
  // FETCH MESSAGES
  // ============================

  const {
    data: messages = [],
    isLoading,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
    refetchInterval: 4000,
  });


  // ============================
  // APPROVE DRAFT
  // ============================

  const approveMutation = useMutation({
    mutationFn: ({ id, draft_reply }) =>
      approveDraft(id, draft_reply),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });

      setSelectedMessage(null);
      setDraft("");
    },

    onError: (error) => {
      console.error(
        "Failed to approve draft:",
        error
      );

      alert(
        "Could not save the draft reply."
      );
    },
  });


  // ============================
  // OPEN REPLY
  // ============================

  const openReply = (message) => {
    setSelectedMessage(message);
    setDraft(message.draft_reply || "");
  };


  // ============================
  // LOADING
  // ============================

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        <div className="mb-2 text-2xl">
          ✨
        </div>

        Loading your inbox...
      </div>
    );
  }


  // ============================
  // EMPTY STATE
  // ============================

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

        <div className="mb-3 text-4xl">
          📭
        </div>

        <h3 className="font-semibold text-slate-800">
          No messages yet
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Sync Gmail or ingest a message to see
          AI triage in action.
        </p>

      </div>
    );
  }


  return (
    <>
      {/* ============================
          MESSAGE LIST
      ============================ */}

      <div className="space-y-4">

        {messages.map((m) => (

          <div
            key={m.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >

            {/* ============================
                HEADER
            ============================ */}

            <div className="flex items-start justify-between gap-4">

              <div className="flex min-w-0 items-center gap-3">

                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">
                  {m.sender
                    ?.charAt(0)
                    .toUpperCase() || "?"}
                </div>


                {/* Sender */}
                <div className="min-w-0">

                  <h3 className="truncate font-semibold text-slate-900">
                    {m.sender}
                  </h3>

                  <p className="truncate text-sm text-slate-500">
                    {m.subject || "(no subject)"}
                  </p>

                </div>

              </div>


              {/* Category */}
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                  categoryStyles[m.category] ||
                  categoryStyles.unclassified
                }`}
              >
                ●{" "}
                {m.category
                  ?.replace("_", " ") ||
                  "unclassified"}
              </span>

            </div>


            {/* ============================
                SUBJECT
            ============================ */}

            <h2 className="mt-6 text-lg font-semibold text-slate-900">
              {m.subject || "No subject"}
            </h2>


            {/* ============================
                AI SUMMARY
            ============================ */}

            {m.summary && (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">

                <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500">
                  <span>✨</span>
                  AI SUMMARY
                </div>

                <p className="text-sm leading-7 text-slate-700">
                  {m.summary}
                </p>

              </div>
            )}


            {/* ============================
                PROCESSING
            ============================ */}

            {!m.processed && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-600">

                <span className="animate-pulse">
                  🤖
                </span>

                AI is processing this message...

              </div>
            )}


            {/* ============================
                APPROVED
            ============================ */}

            {m.draft_approved && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

                <span>✓</span>

                AI reply approved and saved

              </div>
            )}


            {/* ============================
                FOOTER
            ============================ */}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

              {/* View message */}
              <button
                onClick={() =>
                  setShowBody(
                    showBody === m.id
                      ? null
                      : m.id
                  )
                }
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {showBody === m.id
                  ? "Hide message"
                  : "View message"}
              </button>


              {/* AI Reply */}
              {m.draft_reply && (
                <button
                  onClick={() => openReply(m)}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  ✨{" "}
                  {m.draft_approved
                    ? "Edit AI Reply"
                    : "View AI Reply"}
                </button>
              )}

            </div>


            {/* ============================
                ORIGINAL MESSAGE
            ============================ */}

            {showBody === m.id && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Original message
                </p>

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {m.body || "No message body."}
                </p>

              </div>
            )}

          </div>

        ))}

      </div>


      {/* ============================
          AI REPLY MODAL
      ============================ */}

      {selectedMessage && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">


            {/* ============================
                MODAL HEADER
            ============================ */}

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <div>

                <div className="flex items-center gap-2">

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    ✨
                  </span>

                  <h2 className="text-lg font-semibold text-slate-900">
                    AI Draft Reply
                  </h2>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Reply to{" "}
                  <span className="font-medium text-slate-700">
                    {selectedMessage.sender}
                  </span>
                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedMessage(null)
                }
                className="rounded-lg px-3 py-2 text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>

            </div>


            {/* ============================
                MODAL BODY
            ============================ */}

            <div className="p-6">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Draft reply
              </label>


              <textarea
                value={draft}
                onChange={(e) =>
                  setDraft(e.target.value)
                }
                rows={9}
                placeholder="Write your reply..."
                className="w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />


              <div className="mt-3 flex items-center justify-between">

                <p className="text-xs text-slate-400">
                  AI-generated draft · You can edit it before approval.
                </p>

                <span className="text-xs text-slate-400">
                  {draft.length} characters
                </span>

              </div>

            </div>


            {/* ============================
                MODAL FOOTER
            ============================ */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">

              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setDraft("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>


              <button
                onClick={() =>
                  approveMutation.mutate({
                    id: selectedMessage.id,
                    draft_reply: draft.trim(),
                  })
                }
                disabled={
                  approveMutation.isPending ||
                  !draft.trim()
                }
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {approveMutation.isPending
                  ? "Saving..."
                  : "✓ Approve & Save"}

              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}