"use client"

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "unauth" | "not-admin" | "authenticated">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setStatus("unauth");
        return;
      }
      const userId = sessionData.session.user.id;
      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("tipo")
        .eq("id", userId)
        .single();
      if (error || !usuario || usuario.tipo !== "admin") {
        setStatus("not-admin");
        return;
      }
      setStatus("authenticated");
    };
    check();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou senha inválidos.");
      return;
    }
    // Após login, revalida admin
    setStatus("checking");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (status === "checking") {
    return <div className="flex items-center justify-center h-screen">Verificando permissão...</div>;
  }

  if (status === "unauth" || status === "not-admin") {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
          <h2 className="text-xl font-bold text-center mb-2">Login Administrativo</h2>
          {status === "not-admin" && (
            <div className="text-red-500 text-sm text-center">Acesso restrito a administradores.</div>
          )}
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
