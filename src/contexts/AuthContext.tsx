'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

// Constantes para chaves do localStorage
const AUTH_TOKEN_KEY = 'authToken'
const USER_DATA_KEY = 'userData'

interface AuthResult {
  success: boolean
  error?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  idToken: string | null
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
  const [idToken, setIdToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Função para persistir o token no localStorage
  const persistToken = useCallback((accessToken: string | null, userData: User | null) => {
    if (typeof window === 'undefined') return

    if (accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }

    if (userData) {
      localStorage.setItem(
        USER_DATA_KEY,
        JSON.stringify({
          id: userData.id,
          email: userData.email,
          user_metadata: userData.user_metadata,
        })
      )
    } else {
      localStorage.removeItem(USER_DATA_KEY)
    }
  }, [])

  // Função para carregar token do localStorage
  const loadPersistedToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(AUTH_TOKEN_KEY)
  }, [])

  // Inicialização - carregar sessão existente
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Primeiro, tentar carregar do localStorage
        const persistedToken = loadPersistedToken()
        if (persistedToken) {
          setIdToken(persistedToken)
        }

        // Verificar sessão ativa no Supabase
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Erro ao obter sessão:', error)
          persistToken(null, null)
          setIsLoading(false)
          return
        }

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          setIdToken(currentSession.access_token)
          persistToken(currentSession.access_token, currentSession.user)
        } else {
          // Sem sessão ativa, limpar dados
          persistToken(null, null)
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error)
        persistToken(null, null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [loadPersistedToken, persistToken])

  // Listener para mudanças de autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        if (event === 'SIGNED_IN' && currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          setIdToken(currentSession.access_token)
          persistToken(currentSession.access_token, currentSession.user)
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setIdToken(null)
          persistToken(null, null)
        } else if (event === 'TOKEN_REFRESHED' && currentSession) {
          setSession(currentSession)
          setIdToken(currentSession.access_token)
          persistToken(currentSession.access_token, currentSession.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [persistToken])

  // Login com email/senha
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

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
          setSession(data.session)
          setUser(data.session.user)
          setIdToken(data.session.access_token)
          persistToken(data.session.access_token, data.session.user)
          return { success: true }
        }

        return { success: false, error: 'Erro inesperado ao fazer login.' }
      } catch {
        return { success: false, error: 'Erro inesperado ao fazer login.' }
      }
    },
    [persistToken]
  )

  // Login com OAuth
  const loginWithOAuth = useCallback(
    async (provider: 'google' | 'facebook' | 'apple'): Promise<AuthResult> => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: baseUrl,
          },
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
      setSession(null)
      setUser(null)
      setIdToken(null)
      persistToken(null, null)
      // Limpar outros dados do localStorage relacionados ao admin
      localStorage.removeItem('admin')
      localStorage.removeItem('adminData')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }, [persistToken])

  // Atualizar sessão
  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.refreshSession()

      if (error) {
        console.error('Erro ao atualizar sessão:', error)
        return
      }

      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
        setIdToken(currentSession.access_token)
        persistToken(currentSession.access_token, currentSession.user)
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error)
    }
  }, [persistToken])

  const value = useMemo(
    () => ({
      user,
      session,
      idToken,
      isLoading,
      isAuthenticated: !!user && !!session,
      login,
      loginWithOAuth,
      logout,
      refreshSession,
    }),
    [user, session, idToken, isLoading, login, loginWithOAuth, logout, refreshSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }

  return context
}

// Hook para obter apenas o token (útil para chamadas API)
export function useAuthToken() {
  const { idToken } = useAuth()
  return idToken
}
