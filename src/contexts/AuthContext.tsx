'use client'

import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

import { supabase } from '@/lib/supabase'
import {
  saveSessionTokens,
  clearAuthTokens,
  getAccessToken,
  getUserData,
  StoredUserData,
} from '@/lib/auth-token'

interface AuthContextType {
  user: User | null
  session: Session | null
  storedUserData: StoredUserData | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [storedUserData, setStoredUserData] = useState<StoredUserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Garantir que estamos no cliente antes de acessar localStorage
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Inicialização - verificar sessão existente (apenas após montar no cliente)
  useEffect(() => {
    if (!isMounted) return

    const initializeAuth = async () => {
      try {
        // Primeiro, tentar recuperar dados do localStorage
        const storedData = getUserData()
        const storedToken = getAccessToken()

        if (storedData && storedToken) {
          setStoredUserData(storedData)
        }

        // Verificar sessão atual no Supabase
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Erro ao recuperar sessão:', error)
          clearAuthTokens()
          setIsLoading(false)
          return
        }

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)

          // Persistir tokens
          saveSessionTokens({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token,
            user: currentSession.user,
          })

          setStoredUserData({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            name:
              currentSession.user.user_metadata?.name ||
              currentSession.user.user_metadata?.full_name,
          })
        } else {
          // Sem sessão, limpar dados locais
          clearAuthTokens()
          setStoredUserData(null)
        }
      } catch (error) {
        console.error('Erro na inicialização de auth:', error)
        clearAuthTokens()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession)
        setUser(newSession.user)
        saveSessionTokens({
          access_token: newSession.access_token,
          refresh_token: newSession.refresh_token,
          user: newSession.user,
        })
        setStoredUserData({
          id: newSession.user.id,
          email: newSession.user.email || '',
          name: newSession.user.user_metadata?.name || newSession.user.user_metadata?.full_name,
        })
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setStoredUserData(null)
        clearAuthTokens()
      } else if (event === 'TOKEN_REFRESHED' && newSession) {
        setSession(newSession)
        saveSessionTokens({
          access_token: newSession.access_token,
          refresh_token: newSession.refresh_token,
          user: newSession.user,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [isMounted])

  // Função de login
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: Error | null }> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          return { error }
        }

        if (data.session) {
          setSession(data.session)
          setUser(data.user)
          saveSessionTokens({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
          })
          setStoredUserData({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
          })
        }

        return { error: null }
      } catch (error) {
        return { error: error as Error }
      }
    },
    []
  )

  // Função de logout
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setStoredUserData(null)
      clearAuthTokens()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }, [router])

  // Função para refresh da sessão
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Erro ao atualizar sessão:', error)
        return
      }
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        saveSessionTokens({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user: data.user!,
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error)
    }
  }, [])

  const value: AuthContextType = {
    user,
    session,
    storedUserData,
    isLoading,
    isAuthenticated: !!session && !!user,
    signIn,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
