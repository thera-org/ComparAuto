"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, Facebook, Apple } from "lucide-react";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cadastro com e-mail/senha
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!formData.nome || !formData.email || !formData.password) {
      setError("Preencha todos os campos.");
      return;
    }
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.nome } },
      });
      if (error) throw error;
      if (data?.user) {
        await supabase.from("usuarios").insert({
          id: data.user.id,
          nome: formData.nome,
          email: formData.email,
          tipo: "user",
          criado_em: new Date().toISOString(),
        });
      }
      router.push("/conta"); // Redireciona para completar perfil
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Cadastro com OAuth
  const handleOAuthSignup = async (provider: "google" | "facebook" | "apple") => {
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) setError("Erro ao cadastrar com " + provider);
      // Após OAuth, o usuário será redirecionado de volta autenticado
      // No /conta, você pode checar se o perfil está completo
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 transition-all duration-300">
        <div className="mb-6 text-center">
          <Image src="/logo.png" alt="ComparAuto Logo" width={60} height={60} className="mx-auto mb-2" />
          <h2 className="text-2xl font-bold mb-1 text-blue-800 dark:text-blue-300">Criar Conta</h2>
          <p className="text-gray-600 dark:text-zinc-300">Preencha os campos para se cadastrar</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4 dark:bg-red-900/30 dark:border-red-800" role="alert">
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-5" autoComplete="on">
          <div className="flex flex-col gap-1">
            <label htmlFor="nome" className="font-medium">Nome</label>
            <input
              id="nome"
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
              className="form-control px-3 py-2 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-medium">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="form-control px-3 py-2 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-medium">Senha</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
                className="form-control px-3 py-2 pr-10 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={0}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 font-semibold py-2 rounded bg-blue-700 text-white hover:bg-blue-800 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>
        <div className="flex items-center gap-2 my-6">
          <span className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
          <span className="text-gray-500 dark:text-zinc-400 text-sm">ou</span>
          <span className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleOAuthSignup("google")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded bg-white border border-gray-300 hover:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-600 dark:hover:bg-zinc-700 transition-all duration-200"
            disabled={loading}
            aria-label="Cadastrar com Google"
          >
            <Image src="/google-icon.svg" alt="Google" width={20} height={20} className="inline-block" />
            Cadastrar com Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignup("facebook")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200"
            disabled={loading}
            aria-label="Cadastrar com Facebook"
          >
            <Facebook size={20} />
            Cadastrar com Facebook
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignup("apple")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded bg-black text-white hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-all duration-200"
            disabled={loading}
            aria-label="Cadastrar com Apple"
          >
            <Apple size={20} />
            Cadastrar com Apple
          </button>
        </div>
        <p className="mt-6 text-center text-gray-700 dark:text-zinc-200">
          Já tem uma conta?{' '}
          <a href="/login" className="underline text-blue-700 dark:text-blue-400 font-semibold hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors duration-200" style={{ textDecorationThickness: 2 }}>
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}