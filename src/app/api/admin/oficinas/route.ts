import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Verificar se o usuário autenticado é admin
async function getAdminUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('usuarios')
    .select('tipo')
    .eq('id', user.id)
    .eq('tipo', 'admin')
    .single()

  return data ? user : null
}

// GET - Listar oficinas
export async function GET(request: Request) {
  try {
    const adminUser = await getAdminUser()
    if (!adminUser) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const oficinaId = searchParams.get('id')

    if (oficinaId) {
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
    const adminUser = await getAdminUser()
    if (!adminUser) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { userId: _userId, ...oficinaData } = body

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
    const adminUser = await getAdminUser()
    if (!adminUser) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { id, userId: _userId, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID da oficina é obrigatório' }, { status: 400 })
    }

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
    const adminUser = await getAdminUser()
    if (!adminUser) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const oficinaId = searchParams.get('id')

    if (!oficinaId) {
      return NextResponse.json({ error: 'ID da oficina é obrigatório' }, { status: 400 })
    }

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
