// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️  Variáveis de ambiente do Supabase não configuradas!')
  console.warn('Certifique-se de definir:')
  console.warn('- NEXT_PUBLIC_SUPABASE_URL')
  console.warn('- NEXT_PUBLIC_SUPABASE_ANON_KEY')

  // Em desenvolvimento, mostrar erro mais detalhado
  if (process.env.NODE_ENV === 'development') {
    console.warn('Crie um arquivo .env.local baseado no .env.example')
  }
}

// Configurações do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Persistir sessão no localStorage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    // Configuração para OAuth funcionar corretamente
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  // Configurações de rede
  global: {
    headers: {
      'x-application-name': 'ComparAuto',
    },
  },
})

// Função helper para verificar conexão
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('usuarios')
      .select('count', { count: 'exact', head: true })
    return !error
  } catch {
    return false
  }
}

// Função helper para logout seguro
export async function signOut() {
  try {
    await supabase.auth.signOut()
    // Limpar dados locais
    localStorage.removeItem('admin')
    localStorage.removeItem('adminData')
    return { success: true }
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    return { success: false, error }
  }
}
