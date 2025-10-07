// src/app/api/ajuda/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
)

// Log temporário para debug
console.log('ENV Check:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING',
  key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING',
})

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    console.log('Data recebida:', data)

    // Adaptar para os campos da tabela mensagens
    const { nome, email, mensagem } = data
    const conteudo = `Nome: ${nome}\nEmail: ${email}\nMensagem: ${mensagem}`

    console.log('Inserindo conteudo:', conteudo)

    const { error } = await supabase.from('mensagens').insert([{ conteudo }])

    if (error) {
      console.error('Erro Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro geral:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
