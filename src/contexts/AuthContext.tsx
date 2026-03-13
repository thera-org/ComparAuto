'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

interface AuthResult {
  success: boolean
  error?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  loginWithOAuth: (provider: 'google' | 'facebook' | 'apple') => Promise<AuthResult>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Inicialização — carregar sessão existente (gerida pelo @supabase/ssr via cookies)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Erro ao obter sessão:', error)
          return
        }

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Listener para mudanças de autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Login com email/senha
  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        let errorMessage = 'Falha ao fazer login.'
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'E-mail ou senha incorretos.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu e-mail antes de fazer login.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.'
        }
        return { success: false, error: errorMessage }
      }

      if (data.session) {
        return { success: true }
      }

      return { success: false, error: 'Erro inesperado ao fazer login.' }
    } catch {
      return { success: false, error: 'Erro inesperado ao fazer login.' }
    }
  }, [])

  // Login com OAuth
  const loginWithOAuth = useCallback(
    async (provider: 'google' | 'facebook' | 'apple'): Promise<AuthResult> => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: baseUrl },
        })

        if (error) {
          return {
            success: false,
            error: `Erro ao entrar com ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
          }
        }

        return { success: true }
      } catch {
        return { success: false, error: 'Erro inesperado ao fazer login.' }
      }
    },
    []
  )

  // Logout
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }, [])

  // Atualizar sessão
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Erro ao atualizar sessão:', error)
        return
      }
      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!user && !!session,
      login,
      loginWithOAuth,
      logout,
      refreshSession,
    }),
    [user, session, isLoading, login, loginWithOAuth, logout, refreshSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
