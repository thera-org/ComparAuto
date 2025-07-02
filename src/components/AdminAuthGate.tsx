"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

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
        // Verificar se há uma sessão ativa no Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          // Limpar qualquer dados locais
          localStorage.removeItem("admin")
          localStorage.removeItem("adminData")
          router.push("/admin/login")
          return
        }

        // Verificar se o usuário é admin
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role, nome, email")
          .eq("id", session.user.id)
          .eq("role", "admin")
          .single()

        if (userError || !userData) {
          // Se falhar, tentar na tabela usuarios para compatibilidade
          const { data: fallbackUserData, error: fallbackError } = await supabase
            .from("usuarios")
            .select("tipo, nome, email")
            .eq("id", session.user.id)
            .eq("tipo", "admin")
            .single()

          if (fallbackError || !fallbackUserData) {
            // Usuário não é admin ou não existe
            await supabase.auth.signOut()
            localStorage.removeItem("admin")
            localStorage.removeItem("adminData")
            router.push("/admin/login")
            return
          }
          
          // Usar dados da tabela usuarios como fallback
          setIsAuthenticated(true)
          localStorage.setItem("adminData", JSON.stringify({
            nome: fallbackUserData.nome,
            email: fallbackUserData.email,
            sessionId: session.access_token.substring(0, 10)
          }))
          return
        }

        // Usuário autenticado e é admin
        setIsAuthenticated(true)
        
        // Armazenar dados do admin temporariamente (apenas para a sessão)
        localStorage.setItem("adminData", JSON.stringify({
          nome: userData.nome,
          email: userData.email,
          sessionId: session.access_token.substring(0, 10) // Parte do token para validação
        }))

      } catch (error) {
        console.error("Erro na verificação de autenticação:", error)
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()

    // Verificar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          localStorage.removeItem("admin")
          localStorage.removeItem("adminData")
          setIsAuthenticated(false)
          router.push("/admin/login")
        } else if (event === 'SIGNED_IN' && session) {
          // Re-verificar se é admin quando fizer login
          checkAuthentication()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  // Verificação adicional a cada carregamento de página
  useEffect(() => {
    const handlePageLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        localStorage.removeItem("admin")
        localStorage.removeItem("adminData")
        router.push("/admin/login")
      }
    }

    // Verificar quando a página ganhar foco
    window.addEventListener('focus', handlePageLoad)
    
    return () => window.removeEventListener('focus', handlePageLoad)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // O redirecionamento já foi feito
  }

  return <>{children}</>
}
