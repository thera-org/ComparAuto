'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { clearAuthTokens } from '@/lib/auth-token'
import { supabase } from '@/lib/supabase'

interface AdminAuthGateProps {
  children: React.ReactNode
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const { user, session, isLoading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Aguardar o AuthContext carregar
      if (authLoading) return

      // Se não há sessão, redirecionar para login
      if (!session || !user) {
        clearAuthTokens()
        router.push('/admin/login')
        return
      }

      try {
        // Verificar se o usuário é admin
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('role, nome, email')
          .eq('id', user.id)
          .eq('role', 'admin')
          .single()

        if (userError || !userData) {
          // Tentar campo 'tipo' como fallback
          const { data: fallbackUserData, error: fallbackError } = await supabase
            .from('usuarios')
            .select('tipo, nome, email')
            .eq('id', user.id)
            .eq('tipo', 'admin')
            .single()

          if (fallbackError || !fallbackUserData) {
            // Usuário não é admin
            await supabase.auth.signOut()
            clearAuthTokens()
            router.push('/admin/login')
            return
          }

          // É admin via campo 'tipo'
          setIsAdmin(true)
          setIsCheckingAdmin(false)
          return
        }

        // É admin via campo 'role'
        setIsAdmin(true)
        setIsCheckingAdmin(false)
      } catch (error) {
        console.error('Erro na verificação de admin:', error)
        router.push('/admin/login')
      }
    }

    checkAdminStatus()
  }, [authLoading, session, user, router])

  // Verificar quando a página ganhar foco
  useEffect(() => {
    const handlePageFocus = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()
      if (!currentSession) {
        clearAuthTokens()
        router.push('/admin/login')
      }
    }

    window.addEventListener('focus', handlePageFocus)
    return () => window.removeEventListener('focus', handlePageFocus)
  }, [router])

  // Listener para mudanças de autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        clearAuthTokens()
        setIsAdmin(false)
        router.push('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Loading do AuthContext ou verificação de admin
  if (authLoading || isCheckingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Não é admin
  if (!isAdmin) {
    return null // O redirecionamento já foi feito
  }

  return <>{children}</>
}
