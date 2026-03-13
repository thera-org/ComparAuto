import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias'
  )
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: { 'x-application-name': 'ComparAuto' },
    },
  })
}
