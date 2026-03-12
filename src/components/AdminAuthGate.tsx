'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

interface AdminAuthGateProps {
  children: React.ReactNode
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error || !session) {
          router.push('/admin/login')
          return
        }

        // Verificar se o usuário tem tipo = 'admin'
        const { data: adminUser, error: adminError } = await supabase
          .from('usuarios')
          .select('tipo, nome, email')
          .eq('id', session.user.id)
          .eq('tipo', 'admin')
          .single()

        if (adminError || !adminUser) {
          await supabase.auth.signOut()
          router.push('/admin/login')
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        router.push('/admin/login')
      } else if (event === 'SIGNED_IN' && session) {
        checkAuthentication()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Verificar quando a página ganhar foco
  useEffect(() => {
    const handleFocus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setIsAuthenticated(false)
        router.push('/admin/login')
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
