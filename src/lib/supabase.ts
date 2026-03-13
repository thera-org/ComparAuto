// Shim de compatibilidade — preserva `import { supabase } from '@/lib/supabase'`
// Novo código deve importar de:
//   @/lib/supabase/browser  — client components
//   @/lib/supabase/server   — server components / actions
//   @/lib/supabase/admin    — API routes (service role)

import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

// Singleton para client components
export const supabase = createSupabaseBrowserClient()

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
