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

export async function GET(request: Request) {
  try {
    // Verificar autorização com método mais robusto
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
    }
    
    // Extrair token do cabeçalho Bearer
    const providedToken = authHeader.slice(7); // Remove "Bearer "
    const expectedToken = process.env.ADMIN_API_KEY;
    
    if (!expectedToken || providedToken.length !== expectedToken.length) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
    }
    
    // Usar comparação segura contra timing attacks
    let isValid = true;
    for (let i = 0; i < providedToken.length; i++) {
      if (providedToken[i] !== expectedToken[i]) {
        isValid = false;
      }
    }
    
    if (!isValid) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
    }
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

    // Criar um mapa de lookup para authUsers
    const authUserMap = new Map(authUsers?.map((au) => [au.id, au]))

    // Combinar dados
    const formattedUsers = usuarios?.map((user) => {
      const authUser = authUserMap.get(user.id)
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
