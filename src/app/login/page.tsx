"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, AlertCircle, Loader2, LogIn, Facebook, Apple } from "lucide-react";
import Image from "next/image";

// Regex simples para e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [show2FA, setShow2FA] = useState(false);
  const [code2FA, setCode2FA] = useState("");
  const [code2FAError, setCode2FAError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Checa autenticação ao montar
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return;
      if (user) router.replace("/");
    };
    checkAuth();
  }, [router]);

  // Bloqueio temporário após 5 tentativas
  useEffect(() => {
    if (loginAttempts >= 5) {
      const until = Date.now() + 30000;
      setBlockedUntil(until);
      timerRef.current = setTimeout(() => {
        setLoginAttempts(0);
        setBlockedUntil(null);
      }, 30000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [loginAttempts]);

  // Validação em tempo real
  useEffect(() => {
    if (formData.email && !emailRegex.test(formData.email)) {
      setEmailError("E-mail inválido");
    } else {
      setEmailError("");
    }
    if (formData.password && formData.password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
    } else {
      setPasswordError("");
    }
  }, [formData]);

  // Manipula mudança dos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submissão do login
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (blockedUntil && Date.now() < blockedUntil) return;
    if (emailError || passwordError) return;
    setLoading(true);
    try {
      // const { data, error } = await supabase.auth.signInWithPassword({ ... })
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) {
        setLoginAttempts((a) => a + 1);
        if (error.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos.");
        } else if (error.message.includes("Too many requests")) {
          setError("Muitas tentativas de login. Tente novamente mais tarde.");
        } else {
          setError("Falha ao fazer login. Verifique suas informações.");
        }
        return;
      }
      // Simula 2FA
      setShow2FA(true);
    } catch {
      setError("Erro inesperado ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  // Mock 2FA
  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code2FA !== "123456") {
      setCode2FAError("Código inválido. Tente 123456 para simular.");
      return;
    }
    router.replace("/");
  };

  // Login com Google/Facebook/Apple
  const handleOAuthLogin = async (provider: "google" | "facebook" | "apple") => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) setError("Erro ao entrar com " + provider);
    } catch {
      setError("Erro inesperado ao entrar com " + provider);
    } finally {
      setLoading(false);
    }
  };

  // Bloqueio de login
  const isBlocked = blockedUntil && Date.now() < blockedUntil;
  const blockSeconds = isBlocked ? Math.ceil((blockedUntil! - Date.now()) / 1000) : 0;

  // Renderização principal
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900`}> 
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 transition-all duration-300`}> 
        <div className="mb-6 text-center">
          <Image src="/logo.png" alt="ComparAuto Logo" width={60} height={60} className="mx-auto mb-2" />
          <h1 className="text-2xl font-bold mb-1 text-blue-800 dark:text-blue-300">Login</h1>
          <p className="text-gray-600 dark:text-zinc-300">Entre com suas credenciais para acessar sua conta</p>
        </div>
        {/* Mensagem de erro global */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4 dark:bg-red-900/30 dark:border-red-800" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {/* Formulário de login ou 2FA */}
        {!show2FA ? (
          <form onSubmit={handleLogin} className="space-y-5" autoComplete="on">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                aria-label="E-mail"
                aria-invalid={!!emailError}
                className={`form-control px-3 py-2 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${emailError ? "border-red-500" : ""}`}
                autoFocus
              />
              {emailError && <span className="text-xs text-red-500 mt-1" role="alert">{emailError}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-medium">Senha</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  required
                  aria-label="Senha"
                  aria-invalid={!!passwordError}
                  className={`form-control px-3 py-2 pr-10 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${passwordError ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full`}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && <span className="text-xs text-red-500 mt-1" role="alert">{passwordError}</span>}
              <div className="mt-1 text-right">
                <Link href="/forgot-password" className="underline text-blue-700 dark:text-blue-400 font-semibold hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors duration-200" style={{ textDecorationThickness: 2 }}>
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="accent-blue-600" />
              <label htmlFor="remember" className="text-sm">Lembrar de mim</label>
            </div>
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 font-semibold py-2 rounded bg-blue-700 text-white hover:bg-blue-800 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200`}
              disabled={Boolean(loading || emailError || passwordError || isBlocked)}
              aria-disabled={Boolean(loading || emailError || passwordError || isBlocked) ? "true" : undefined}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {isBlocked ? `Aguarde ${blockSeconds}s` : loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-5" autoComplete="off">
            <div className="flex flex-col gap-1">
              <label htmlFor="code2fa" className="font-medium">Código de verificação (2FA)</label>
              <input
                id="code2fa"
                name="code2fa"
                type="text"
                value={code2FA}
                onChange={e => { setCode2FA(e.target.value); setCode2FAError(""); }}
                placeholder="Digite o código (ex: 123456)"
                required
                aria-label="Código de verificação"
                aria-invalid={!!code2FAError}
                className={`form-control px-3 py-2 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${code2FAError ? "border-red-500" : ""}`}
                autoFocus
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
              />
              {code2FAError && <span className="text-xs text-red-500 mt-1" role="alert">{code2FAError}</span>}
            </div>
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 font-semibold py-2 rounded bg-blue-700 text-white hover:bg-blue-800 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200`}
            >
              Confirmar código
            </button>
          </form>
        )}
        <div className="flex items-center gap-2 my-6">
          <span className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
          <span className="text-gray-500 dark:text-zinc-400 text-sm">ou</span>
          <span className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleOAuthLogin("google")}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded bg-white border border-gray-300 hover:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-600 dark:hover:bg-zinc-700 transition-all duration-200`}
            disabled={loading}
            aria-label="Entrar com Google"
            title="Entrar com Google"
            type="button"
          >
            <Image src="/google-icon.svg" alt="Google" width={20} height={20} className="inline-block" />
            Entrar com Google
          </button>
          <button
            onClick={() => handleOAuthLogin("facebook")}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200`}
            disabled={loading}
            aria-label="Entrar com Facebook"
            title="Entrar com Facebook"
            type="button"
          >
            <Facebook size={20} />
            Entrar com Facebook
          </button>
          <button
            onClick={() => handleOAuthLogin("apple")}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded bg-black text-white hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-all duration-200`}
            disabled={loading}
            aria-label="Entrar com Apple"
            title="Entrar com Apple"
            type="button"
          >
            <Apple size={20} />
            Entrar com Apple
          </button>
        </div>
        <p className="mt-6 text-center text-gray-700 dark:text-zinc-200">
          Não tem uma conta?{' '}
          <Link href="/signup" className="underline text-blue-700 dark:text-blue-400 font-semibold hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors duration-200" style={{ textDecorationThickness: 2 }}>
            Crie agora
          </Link>
        </p>
      </div>
    </div>
  );
}