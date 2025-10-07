"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useNotifications } from '@/contexts/NotificationContext';
import styles from './admin-login.module.css';

export default function AdminLogin() {
  const { success, error: showError } = useNotifications();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const router = useRouter();

  // Verificar se já está logado
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verificar se é admin
        const { data: userData } = await supabase
          .from("usuarios")
          .select("role")
          .eq("id", session.user.id)
          .eq("role", "admin")
          .single()
        
        if (userData) {
          router.push("/admin")
        } else {
          // Não é admin, limpar sessão
          const { data: fallbackData } = await supabase
            .from("usuarios")
            .select("tipo")
            .eq("id", session.user.id)
            .eq("tipo", "admin")
            .single()
          
          if (fallbackData) {
            router.push("/admin")
          }
        }
      }
    };
    
    checkSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar tentativas de login
    if (attempts >= 3) {
      setIsBlocked(true);
      showError("Bloqueado", "Muitas tentativas de login. Tente novamente em 5 minutos.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Fazer login com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.senha
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Verificar se o usuário é admin
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("role, nome, email")
          .eq("id", authData.user.id)
          .eq("role", "admin")
          .single();

        if (userError || !userData) {
          // Se não for admin, fazer logout imediatamente
          await supabase.auth.signOut();
          setAttempts(prev => prev + 1);
          showError("Acesso não autorizado", "Apenas administradores podem acessar.");
          return;
        }

        // Sucesso - limpar tentativas e redirecionar
        setAttempts(0);
        setIsBlocked(false);
        
        success("Login realizado!", `Bem-vindo, ${userData.nome || userData.email}!`);
        
        // Log da sessão para auditoria
        console.log(`Admin login: ${userData.email} at ${new Date().toISOString()}`);
        
        router.push("/admin");
      }
    } catch (error: unknown) {
      console.error("Erro no login:", error);
      
      setAttempts(prev => prev + 1);
      
      // Mensagens de erro mais específicas
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message?.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha inválidos.";
        } else if (error.message?.includes("Email not confirmed")) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
        } else if (error.message?.includes("Too many requests")) {
          errorMessage = "Muitas tentativas. Aguarde alguns minutos.";
          setIsBlocked(true);
        }
      }
      
      showError("Erro no login", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.adminLoginContainer}>
      <form
        onSubmit={handleSubmit}
        className={styles.adminForm}
      >
        <div className={styles.adminHeader}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            className={styles.logo}
          />
          <h2 className={styles.title}>
            Login Admin
          </h2>
          <span className={styles.subtitle}>
            Acesso restrito ao painel administrativo
          </span>
        </div>
        <div className={styles.inputGroup}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            onChange={handleChange}
            required
            className={styles.input}
          />
          {attempts > 0 && (
            <div className="text-red-500 text-sm mt-2">
              Tentativas restantes: {3 - attempts}
            </div>
          )}
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || isBlocked}        >
          {loading ? (
            <span className={styles.loadingContainer}>
              <svg
                className={styles.loadingSpinner}
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
          ) : isBlocked ? (
            "Bloqueado"
          ) : (
            "Entrar"
          )}
        </button>
      </form>
    </div>
  );
}
