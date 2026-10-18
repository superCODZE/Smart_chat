"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signUp.email({ name, email, password });

    setLoading(false);
    if (error) {
      setError(error.message ?? "Inscription impossible.");
      return;
    }
    router.push("/Talk");
  };

  const input =
    "w-full rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-violet-200/40";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09070d] px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-violet-200/10 bg-[#100b17] p-6"
      >
        <h1 className="text-xl font-semibold">Créer un compte</h1>
        <input className={input} type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Mot de passe (8 caractères minimum)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-40"
        >
          {loading ? "Création..." : "S'inscrire"}
        </button>
        <p className="text-center text-sm text-zinc-500">
          Déjà un compte ? <a href="/Sign_in" className="text-violet-300 hover:underline">Se connecter</a>
        </p>
      </form>
    </main>
  );
}