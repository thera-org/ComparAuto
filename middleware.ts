import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Verificar se é uma rota administrativa
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acesso à página de login
    if (req.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Para outras rotas admin, verificação será feita no componente AdminAuthGate
    // Este middleware serve apenas como uma primeira camada de proteção
    const accessToken = req.cookies.get('sb-access-token')?.value
    const refreshToken = req.cookies.get('sb-refresh-token')?.value
    
    if (!accessToken && !refreshToken) {
      // Redirecionar para login se não houver tokens de sessão
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
