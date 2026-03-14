import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseAdmin } from '@/lib/supabase/admin'

const ALLOWED_TIPOS = ['cliente', 'oficina'] as const
type TipoUsuario = (typeof ALLOWED_TIPOS)[number]

// Campos de perfil aceitos por este endpoint – campos fora desta lista são ignorados
const PROFILE_FIELDS = [
  'nome',
  'telefone',
  'nome_empresa',
  'cnpj',
  'razao_social',
  'nome_oficina',
  'endereco',
  'cidade',
  'estado',
  'cep',
  'cpf',
] as const

/**
 * POST /api/auth/register-profile
 *
 * Cria o perfil em `usuarios` usando service role, necessário no fluxo de confirmação
 * de e-mail onde a sessão ainda não existe e auth.uid() seria NULL, bloqueando o INSERT
 * pelas políticas de RLS.
 *
 * Segurança:
 * - Verifica que o usuário existe no Auth e que o e-mail bate
 * - Nunca permite tipo='admin' (só 'cliente' ou 'oficina')
 * - Idempotente: retorna sucesso se o perfil já existir
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, tipo } = body as Record<string, unknown>

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email é obrigatório' }, { status: 400 })
    }
    if (!ALLOWED_TIPOS.includes(tipo as TipoUsuario)) {
      return NextResponse.json(
        { error: `tipo deve ser um de: ${ALLOWED_TIPOS.join(', ')}` },
        { status: 400 }
      )
    }

    // Verificar que o usuário realmente existe no Auth e que o e-mail corresponde
    const { data: authData, error: authError } = await getSupabaseAdmin().auth.admin.getUserById(id)
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    if (authData.user.email !== email) {
      return NextResponse.json({ error: 'E-mail não corresponde ao usuário' }, { status: 400 })
    }

    // Idempotente: se o perfil já existe, retornar sucesso sem duplicar
    const { data: existing } = await getSupabaseAdmin()
      .from('usuarios')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: true })
    }

    // Construir objeto de perfil apenas com campos permitidos (lista branca)
    const profileData: Record<string, unknown> = { id, email, tipo }
    for (const field of PROFILE_FIELDS) {
      const value = (body as Record<string, unknown>)[field]
      if (value !== undefined && value !== null) {
        profileData[field] = value
      }
    }

    // Inserir perfil com service role (ignora RLS)
    const { error: insertError } = await getSupabaseAdmin().from('usuarios').insert(profileData)

    if (insertError) {
      console.error('Erro ao criar perfil de usuário:', insertError)
      return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Erro na API register-profile:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
