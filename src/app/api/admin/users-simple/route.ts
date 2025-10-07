import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Buscar todos os usuários da tabela usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: false })

    if (usuariosError) {
      console.error('Erro ao buscar usuários:', usuariosError)
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }

    // Como não temos acesso direto aos auth users sem service role key,
    // vamos trabalhar apenas com os dados da tabela usuarios
    // Certifique-se de que o email está sendo salvo na tabela usuarios durante o cadastro
    const formattedUsers = usuarios?.map((user) => {
      return {
        id: user.id,
        nome: user.nome || 'Sem nome',
        email: user.email || 'Email não disponível',
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
