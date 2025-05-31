import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Criar cliente Supabase com service role key para operações admin
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  try {
    // Buscar todos os usuários da tabela usuarios
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: false })

    if (usuariosError) {
      console.error('Erro ao buscar usuários:', usuariosError)
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }

    // Buscar informações de auth dos usuários
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error('Erro ao buscar auth users:', authError)
      // Continue sem os dados de auth se houver erro
    }

    // Combinar dados
    const formattedUsers = usuarios?.map((user) => {
      const authUser = authUsers?.find((au) => au.id === user.id)
      return {
        id: user.id,
        nome: user.nome || 'Sem nome',
        email: authUser?.email || user.email || 'Email não disponível',
        tipo: user.tipo || 'user',
        criado_em: user.criado_em,
      }
    }) || []

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
