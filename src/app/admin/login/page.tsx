"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .eq("tipo", "admin")
      .eq("username", form.username)
      .eq("senha", form.senha)
      .single();
    setLoading(false);
    if (data) {
      localStorage.setItem("admin", "true");
      router.push("/admin/usuarios");
    } else {
      alert("Usuário ou senha inválidos");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-sm p-8 bg-white rounded-2xl shadow-xl border border-blue-100"
      >
        <div className="flex flex-col items-center mb-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="mb-2"
          />
          <h2 className="text-2xl font-extrabold text-blue-700 mb-1">
            Login Admin
          </h2>
          <span className="text-sm text-blue-400 font-medium">
            Acesso restrito ao painel administrativo
          </span>
        </div>
        <div className="space-y-3">
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-700 placeholder:text-blue-300"
          />
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-700 placeholder:text-blue-300"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold px-4 py-2 rounded-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Entrando...
            </span>
          ) : (
            "Entrar"
          )}
        </button>
      </form>
    </div>
  );
}
