'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState, useEffect, useRef } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { useAppNotifications } from '@/hooks/useAppNotifications'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const router = useRouter()
  const { auth } = useAppNotifications()
  const { isAuthenticated, isLoading: authLoading, login, loginWithOAuth } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      router.replace(redirect || '/')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (loginAttempts >= 5) {
      const until = Date.now() + 30000
      setBlockedUntil(until)
      timerRef.current = setTimeout(() => {
        setLoginAttempts(0)
        setBlockedUntil(null)
      }, 30000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [loginAttempts])

  useEffect(() => {
    if (formData.email && !emailRegex.test(formData.email)) {
      setEmailError('E-mail inválido')
    } else {
      setEmailError('')
    }
    if (formData.password && formData.password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres')
    } else {
      setPasswordError('')
    }
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (blockedUntil && Date.now() < blockedUntil) {
      const remainingTime = Math.ceil((blockedUntil - Date.now()) / 1000)
      setError(`Login temporariamente bloqueado. Tente novamente em ${remainingTime} segundos.`)
      return
    }

    if (emailError || passwordError) return

    setLoading(true)
    try {
      const result = await login(formData.email, formData.password)

      if (!result.success) {
        setLoginAttempts(a => a + 1)
        setError(result.error || 'Falha ao fazer login.')
        auth.loginError(result.error)
        return
      }

      setLoginAttempts(0)
      auth.loginSuccess()

      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      router.replace(redirect || '/')
    } catch {
      setError('Erro inesperado ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setLoading(true)
      const result = await loginWithOAuth(provider)

      if (!result.success) {
        setError(
          result.error ||
            'Erro ao entrar com ' + provider.charAt(0).toUpperCase() + provider.slice(1)
        )
      }
    } catch {
      setError(
        'Erro inesperado ao entrar com ' + provider.charAt(0).toUpperCase() + provider.slice(1)
      )
    } finally {
      setLoading(false)
    }
  }

  const isBlocked = blockedUntil && Date.now() < blockedUntil
  const blockSeconds = isBlocked ? Math.ceil((blockedUntil! - Date.now()) / 1000) : 0

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-gray-500">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-icons text-3xl text-primary">build_circle</span>
          <span className="text-xl font-bold text-gray-900">ComparAuto</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-600 sm:block">Não tem uma conta?</span>
          <Link
            href="/signup"
            className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            Cadastre-se
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-grow items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-semibold text-gray-900">Bem-vindo de volta</h1>
              <p className="text-gray-500">Entre para continuar no ComparAuto</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <span className="material-icons text-red-500">error_outline</span>
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="mb-6 space-y-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 font-medium transition hover:bg-gray-50 disabled:opacity-50"
              >
                <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
                <span className="text-gray-700">Continuar com Google</span>
              </button>
              <button
                onClick={() => handleOAuthLogin('facebook')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-3 font-medium text-white transition hover:bg-[#166FE5] disabled:opacity-50"
              >
                <span className="material-icons text-xl">facebook</span>
                <span>Continuar com Facebook</span>
              </button>
              <button
                onClick={() => handleOAuthLogin('apple')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Continuar com Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-sm text-gray-500">ou</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 transition placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {emailError && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                    <span className="material-icons text-sm">error</span>
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    required
                    className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-gray-900 transition placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-icons-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                    <span className="material-icons text-sm">error</span>
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">Lembrar de mim</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={Boolean(loading || emailError || passwordError || isBlocked)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Entrando...</span>
                  </>
                ) : isBlocked ? (
                  <span>Aguarde {blockSeconds}s</span>
                ) : (
                  <>
                    <span className="material-icons">login</span>
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Prompt */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <Link href="/ajuda" className="hover:text-gray-700">
                Ajuda
              </Link>
              <span>·</span>
              <Link href="/termos" className="hover:text-gray-700">
                Termos de Uso
              </Link>
              <span>·</span>
              <Link href="/privacidade" className="hover:text-gray-700">
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
