"use client";

import { useState } from "react";

type Message = {
  text: string;
  sender: "user" | "bot";
};

const quickPrompts = [
  "Summarize this idea in 3 bullets",
  "Give me a creative title for this project",
  "Help me plan a productive day",
  "Explain this in simple terms",
];

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I’m Smart Chat. Ask me anything and I’ll help you turn your ideas into clear answers.",
      sender: "bot",
    },
  ]);

  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const userMessage: Message = { text: prompt, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server.");
      }

      const data = await response.json();
      const botMessage: Message = { text: data.text, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Sorry, an error occurred.", sender: "bot" },
      ]);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.28),_transparent_38%),linear-gradient(135deg,_#0f172a_0%,_#111827_35%,_#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_20px_45px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold shadow-lg shadow-violet-500/40">
              S
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-violet-200/80">Smart chat</p>
              <h1 className="text-lg font-semibold text-white">AI conversation</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Online
          </div>
        </header>

        <section className="grid flex-1 gap-6 rounded-[28px] border border-white/10 bg-slate-950/40 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.5)] backdrop-blur-xl md:grid-cols-[260px_minmax(0,1fr)] md:p-5">
          <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Inspiration</h2>
            </div>

            <div className="space-y-3">
              {quickPrompts.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPrompt(item)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-left text-sm text-slate-200 transition hover:border-violet-400/60 hover:bg-violet-500/10 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex min-h-[600px] flex-col rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/50">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200/80">Conversation</p>
                <h2 className="mt-1 text-base font-semibold text-white">Your smart assistant</h2>
              </div>
              <button
                type="button"
                onClick={() => setMessages([{ text: "Hi! I’m Smart Chat. Ask me anything and I’ll help you turn your ideas into clear answers.", sender: "bot" }])}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-violet-400/60 hover:text-white"
              >
                New chat
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border border-white/5 bg-slate-900/40 p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.sender}-${index}`}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-lg ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
                        : "border border-white/10 bg-slate-800/90 text-slate-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/90 px-4 py-3 text-sm text-slate-200">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-[0_18px_35px_rgba(15,23,42,0.32)]">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={1}
                  placeholder="Type your message..."
                  className="max-h-32 min-h-[52px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      const form = event.currentTarget.form;
                      if (form) form.requestSubmit();
                    }
                  }}
                />

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
