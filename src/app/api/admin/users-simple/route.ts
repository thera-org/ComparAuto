import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Verificar autenticação via sessão
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: adminCheck } = await supabase
      .from('usuarios')
      .select('tipo')
      .eq('id', user.id)
      .eq('tipo', 'admin')
      .single()

    if (!adminCheck) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar usuários com service role
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: false })

    if (usuariosError) {
      console.error('Erro ao buscar usuários:', usuariosError)
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }

    const formattedUsers =
      usuarios?.map(u => ({
        id: u.id,
        nome: u.nome || 'Sem nome',
        email: u.email || 'Email não disponível',
        tipo: u.tipo || 'user',
        criado_em: u.criado_em,
      })) || []

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
