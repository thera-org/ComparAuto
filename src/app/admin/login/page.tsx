"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from './admin-login.module.css';

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
            name="username"
            placeholder="Username"
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
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}        >
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
          ) : (
            "Entrar"
          )}
        </button>
      </form>
    </div>
  );
}
