"use client";

import { useEffect, useState } from "react";
import LimitPage from "@/components/limit_page";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";


type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function Chat() {
  const router = useRouter();
  // The session determines whether the user is signed in and whether
  // account actions such as sign-out and deletion should be displayed.
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  // These states prevent repeated actions and display a clear error
  // if account deletion fails.
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [showLimitPage, setShowLimitPage] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [resetAt, setResetAt] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I’m Smart Chat. Ask me anything and I’ll help you turn your ideas into clear answers.",
      sender: "bot",
    },
  ]);

  useEffect(() => {
    // Signed-in users are not subject to the anonymous usage limit.
    // Therefore, check the limit only when there is no active session.
    if (sessionPending || session) return;

    let active = true;

    const checkLimit = async () => {
      try {
        // The API returns the limit status and reset timestamp.
        const response = await fetch("/api/chat");
        const data = await response.json();

        if (active && data.limited === true) {
          setLimitReached(true);
          setShowLimitPage(true);
          setResetAt(typeof data.resetAt === "number" ? data.resetAt : null);
        }
      } catch (error) {
        console.error("Error checking token limit:", error);
      }
    };

    checkLimit();

    return () => {
      active = false;
    };
  }, [session, sessionPending]);

  useEffect(() => {
    // Once the reset time is reached, the user can send messages again
    // without reloading the page.
    if (!resetAt) return;

    const timer = window.setTimeout(() => {
      setLimitReached(false);
      setResetAt(null);
    }, Math.max(0, resetAt - Date.now()));

    return () => window.clearTimeout(timer);
  }, [resetAt]);

  const handleSignOut = async () => {
    // Better Auth invalidates the session on the server and removes its cookie.
    const { error } = await authClient.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return;
    }

    router.replace("/");
  };

  const handleDeleteAccount = async () => {
    // The confirmation prevents accidental deletion because this operation
    // permanently removes the user and their associated data.
    if (
      !window.confirm(
        "Supprimer définitivement votre compte et toutes vos données ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    setDeletingAccount(true);
    setAccountError(null);

    try {
      // This request calls the Better Auth route enabled in lib/auth.ts.
      // The server identifies the user through their secure session.
      const { error } = await authClient.deleteUser({});

      if (error) {
        console.error("Error deleting account:", error);
        setAccountError(
          error.message || "Impossible de supprimer le compte. Veuillez réessayer.",
        );
        return;
      }

      // Reload the main page so the session state is refreshed after the
      // account and its authentication cookie have been deleted.
      window.location.replace("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setAccountError("Impossible de supprimer le compte. Veuillez réessayer.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const userMessage: Message = { text: prompt, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      // The message is sent to the server API, which calls the Gemini model
      // and returns either the response or the usage-limit status.
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (response.status === 429 && data.error === "limit_reached") {
        setLimitReached(true);
        setShowLimitPage(true);
        setResetAt(typeof data.resetAt === "number" ? data.resetAt : null);
        return;
      }

      if (!response.ok) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text:
              typeof data.error === "string"
                ? data.error
                : "The chat service is temporarily unavailable. Please try again.",
            sender: "bot",
          },
        ]);
        return;
      }

      const botMessage: Message = { text: data.text, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: error instanceof Error ? error.message : "Sorry, an error occurred.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1b1028_0%,#09070d_42%,#020202_100%)] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col overflow-hidden rounded-3xl border border-violet-300/10 bg-[#0b080f]/95 shadow-2xl shadow-black/60 sm:min-h-[calc(100vh-5rem)]">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Smart Chat</h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online and ready to help
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">
              AI assistant
            </span>
            {session && (
              <>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={deletingAccount}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Se déconnecter
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="rounded-xl border border-red-400/30 px-3 py-1.5 text-xs text-red-300 transition hover:border-red-300/60 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {/* The button shows progress during the request to prevent
                      multiple deletion requests from being sent at once. */}
                  {deletingAccount ? "Suppression..." : "Supprimer le compte"}
                </button>
              </>
            )}
          </div>
        </header>

        <section className="flex flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">
          {accountError && (
            <p role="alert" className="mb-3 text-center text-xs text-red-300">
              {accountError}
            </p>
          )}
          {limitReached && (
            <p
              role="status"
              className="mb-3 text-center text-xs text-amber-300/80"
            >
              Please wait 2 hours before using the chat again.
            </p>
          )}

          <div className="flex min-h-[320px] flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border border-violet-200/10 bg-[#050308]/70 p-4 sm:p-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[70%] ${
                    message.sender === "user"
                      ? "rounded-br-md bg-white text-black"
                      : "rounded-bl-md border border-violet-200/10 bg-[#17101d] text-zinc-300"
                  }`}
                >
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-50">
                    {message.sender === "user" ? "You" : "Smart Chat"}
                  </p>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-violet-200/10 bg-[#17101d] px-4 py-3 text-sm text-zinc-500">
                  Smart Chat is thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex gap-2 rounded-2xl border border-violet-200/10 bg-[#100b17] p-2 focus-within:border-violet-200/30">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Message Smart Chat..."
              disabled={loading || limitReached}
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || limitReached || !prompt.trim()}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-zinc-600">
            Smart Chat can make mistakes. Check important information.
          </p>

          {showLimitPage && (
            <LimitPage onClose={() => setShowLimitPage(false)} />
          )}
        </section>
      </div>
    </main>
  );
}