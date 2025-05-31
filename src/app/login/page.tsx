"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, AlertCircle, Loader2, LogIn, Facebook, Apple } from "lucide-react";
import Image from "next/image";
import styles from './login.module.css';

// Regex simples para e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");  const [loginAttempts, setLoginAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Checa autenticação ao montar
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return;
      if (user) {
        // Se veio com redirect, manda para lá
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        if (redirect) {
          router.replace(redirect);
        } else {
          router.replace("/");
        }
      }
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
  };  // Submissão do login
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (blockedUntil && Date.now() < blockedUntil) {
      const remainingTime = Math.ceil((blockedUntil - Date.now()) / 1000);
      setError(`Login temporariamente bloqueado. Tente novamente em ${remainingTime} segundos.`);
      return;
    }
    if (emailError || passwordError) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        setLoginAttempts((a) => a + 1);
        if (error.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Por favor, confirme seu e-mail antes de fazer login.");
        } else if (error.message.includes("Too many requests")) {
          setError("Muitas tentativas de login. Tente novamente mais tarde.");
        } else {
          setError("Falha ao fazer login. Verifique suas informações.");
        }
        return;
      }

      // Login bem-sucedido
      if (data.session) {
        // Verifica se há parâmetro de redirect
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        
        if (redirect) {
          router.replace(redirect);
        } else {
          router.replace("/");
        }
      }
    } catch {
      setError("Erro inesperado ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  // Login com Google/Facebook/Apple
  const handleOAuthLogin = async (provider: "google" | "facebook" | "apple") => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) setError("Erro ao entrar com " + provider.charAt(0).toUpperCase() + provider.slice(1));
    } catch {
      setError("Erro inesperado ao entrar com " + provider.charAt(0).toUpperCase() + provider.slice(1));
    } finally {
      setLoading(false);
    }
  };

  // Bloqueio de login
  const isBlocked = blockedUntil && Date.now() < blockedUntil;
  const blockSeconds = isBlocked ? Math.ceil((blockedUntil! - Date.now()) / 1000) : 0;
  // Renderização principal
  return (
    <div className={styles.loginContainer}> 
      <div className={styles.loginCard}> 
        <div className={styles.loginHeader}>
          <Image src="/logo.png" alt="ComparAuto Logo" width={60} height={60} className={styles.logo} />
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Entre com suas credenciais para acessar sua conta</p>
        </div>        {/* Mensagem de erro global */}
        {error && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}        {/* Formulário de login */}
        <form onSubmit={handleLogin} className={styles.form} autoComplete="on">
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
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
              className={`${styles.input} ${emailError ? styles.error : ""}`}
              autoFocus
            />
            {emailError && <span className={styles.inputError} role="alert">{emailError}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Senha</label>
            <div className={styles.passwordContainer}>
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
                className={`${styles.input} ${passwordError ? styles.error : ""}`}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={0}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && <span className={styles.inputError} role="alert">{passwordError}</span>}
            <div className={styles.forgotPassword}>
              <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                Esqueceu sua senha?
              </Link>
            </div>
          </div>
          <div className={styles.rememberMe}>
            <input type="checkbox" id="remember" className={styles.checkbox} />
            <label htmlFor="remember">Lembrar de mim</label>
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={Boolean(loading || emailError || passwordError || isBlocked)}
            aria-disabled={Boolean(loading || emailError || passwordError || isBlocked) ? "true" : undefined}
          >
            {loading ? <Loader2 className={styles.spinning} size={20} /> : <LogIn size={20} />}
            {isBlocked ? `Aguarde ${blockSeconds}s` : loading ? "Entrando..." : "Entrar"}
          </button>
        </form><div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>ou</span>
          <span className={styles.dividerLine} />
        </div>
        <div className={styles.oauthButtons}>
          <button
            onClick={() => handleOAuthLogin("google")}
            className={styles.oauthButton}
            disabled={loading}
            aria-label="Entrar com Google"
            title="Entrar com Google"
            type="button"
          >
            <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
            Entrar com Google
          </button>
          <button
            onClick={() => handleOAuthLogin("facebook")}
            className={`${styles.oauthButton} ${styles.facebook}`}
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
            className={`${styles.oauthButton} ${styles.apple}`}
            disabled={loading}
            aria-label="Entrar com Apple"
            title="Entrar com Apple"
            type="button"
          >
            <Apple size={20} />
            Entrar com Apple
          </button>
        </div>
        <div className={styles.signupPrompt}>
          Não tem uma conta?{' '}
          <Link href="/signup" className={styles.signupLink}>
            Crie agora
          </Link>
        </div>
      </div>
    </div>
  );
}