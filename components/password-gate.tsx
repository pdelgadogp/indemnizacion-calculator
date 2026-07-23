"use client";

import { useEffect, useState } from "react";

const PASSWORD = process.env.NEXT_PUBLIC_PASSWORD || "";
const STORAGE_KEY = "ind_auth";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setOk(true);
    setReady(true);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOk(true);
    } else {
      setError(true);
      setInput("");
    }
  };

  if (!ready) return null;
  if (ok) return <>{children}</>;

  return (
    <main className="h-screen flex items-center justify-center bg-zinc-50">
      <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 w-72">
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          placeholder="Contraseña"
          autoFocus
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        />
        {error && <p className="text-[11px] text-red-500 mb-3">Contraseña incorrecta</p>}
        <button
          type="submit"
          className="w-full py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
