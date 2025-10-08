import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Criar cliente Supabase com service role key para operações admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Verificar se o usuário é admin
async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('tipo')
      .eq('id', userId)
      .single()

    if (error) return false
    return data?.tipo === 'admin'
  } catch {
    return false
  }
}

// GET - Listar oficinas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const oficinaId = searchParams.get('id')

    if (oficinaId) {
      // Buscar oficina específica
      const { data, error } = await supabaseAdmin
        .from('oficinas')
        .select('*')
        .eq('id', oficinaId)
        .single()

      if (error) {
        console.error('Erro ao buscar oficina:', error)
        return NextResponse.json({ error: 'Oficina não encontrada' }, { status: 404 })
      }

      return NextResponse.json({ oficina: data })
    } else {
      // Listar todas as oficinas
      const { data, error } = await supabaseAdmin.from('oficinas').select('*').order('nome')

      if (error) {
        console.error('Erro ao buscar oficinas:', error)
        return NextResponse.json({ error: 'Erro ao buscar oficinas' }, { status: 500 })
      }

      return NextResponse.json({ oficinas: data })
    }
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar nova oficina
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, ...oficinaData } = body

    // Verificar se é admin
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Criar oficina
    const { data, error } = await supabaseAdmin
      .from('oficinas')
      .insert(oficinaData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar oficina:', error)
      return NextResponse.json({ error: 'Erro ao criar oficina' }, { status: 500 })
    }

    return NextResponse.json({ oficina: data }, { status: 201 })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH - Atualizar oficina
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, userId, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID da oficina é obrigatório' }, { status: 400 })
    }

    // Verificar se é admin
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Atualizar oficina com bypass de RLS
    const { data, error } = await supabaseAdmin
      .from('oficinas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar oficina:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar oficina', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ oficina: data })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir oficina
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const oficinaId = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!oficinaId) {
      return NextResponse.json({ error: 'ID da oficina é obrigatório' }, { status: 400 })
    }

    // Verificar se é admin
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Excluir oficina com bypass de RLS
    const { error } = await supabaseAdmin.from('oficinas').delete().eq('id', oficinaId)

    if (error) {
      console.error('Erro ao excluir oficina:', error)
      return NextResponse.json({ error: 'Erro ao excluir oficina' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Oficina excluída com sucesso' })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
