// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️  Variáveis de ambiente do Supabase não configuradas!');
  console.error('Certifique-se de definir:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  // Em desenvolvimento, mostrar erro mais detalhado
  if (process.env.NODE_ENV === 'development') {
    console.error('Crie um arquivo .env.local baseado no .env.example');
  }
  
  throw new Error('Configuração do Supabase está incompleta');
}

// Configurações do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Persistir sessão no localStorage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
  },
  // Configurações de rede
  global: {
    headers: {
      'x-application-name': 'ComparAuto',
    },
  },
});

// Função helper para verificar conexão
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
}

// Função helper para logout seguro
export async function signOut() {
  try {
    await supabase.auth.signOut();
    // Limpar dados locais
    localStorage.removeItem('admin');
    localStorage.removeItem('adminData');
    return { success: true };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { success: false, error };
  }
}