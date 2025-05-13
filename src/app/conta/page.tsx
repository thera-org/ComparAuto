"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
 
interface UserMetadata {
  full_name?: string
  avatar_url?: string
}

interface UserProfile {
  id: string
  email: string
  nome?: string
  role?: string
  user_metadata?: UserMetadata
}

export default function ContaPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        setUser(null)
        setLoading(false)
        return
      }
      // Busca dados extras do perfil se necessário
      const { data: userDoc } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()
      setUser({ ...user, ...userDoc })
      setLoading(false)
    }
    fetchUser()
  }, [])

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>
  }

  if (!user) {
    return <div className="p-8 text-center">Faça login para acessar sua conta.</div>
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <span className="font-medium">Nome:</span> {user.nome || user.user_metadata?.full_name}
        </div>
        <div>
          <span className="font-medium">E-mail:</span> {user.email}
        </div>
        <div>
          <span className="font-medium">Função:</span> {user.role || "usuário"}
        </div>
        {/* Adicione mais informações do perfil aqui */}
      </div>
    </div>
  )
}