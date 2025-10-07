'use client'

import { LayoutDashboard, Users, Wrench, Menu, LogOut, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type React from 'react'

import UserAvatar from '@/app/admin/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { supabase } from '@/lib/supabase'

interface AdminLayoutProps {
  children: React.ReactNode
  searchPlaceholder?: string
  onSearch?: (term: string) => void
}

export default function AdminLayout({
  children,
  searchPlaceholder = 'Buscar...',
  onSearch,
}: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [adminName, setAdminName] = useState<string | null>(null)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    // Verificar autenticação e obter dados do admin
    const getAdminData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('nome, email')
          .eq('id', session.user.id)
          .eq('tipo', 'admin')
          .single()

        if (userData) {
          setAdminName(userData.nome || 'Administrador')
        }
      }
    }

    getAdminData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Limpar qualquer dado local
    localStorage.removeItem('admin')
    localStorage.removeItem('adminData')
    window.location.href = '/admin/login'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Limpar qualquer dado local
    localStorage.removeItem('admin')
    localStorage.removeItem('adminData')
    router.push('/admin/login')
  }

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral do sistema',
    },
    {
      href: '/admin/usuarios',
      label: 'Usuários',
      icon: Users,
      description: 'Gerenciar usuários',
    },
    {
      href: '/admin/oficinas',
      label: 'Oficinas',
      icon: Wrench,
      description: 'Gerenciar oficinas',
    },
  ]

  const renderNavigation = () => (
    <nav className="space-y-2 py-4">
      {navItems.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center rounded-lg px-4 py-3 text-sm transition-all duration-200 ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-md'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 transition-colors ${
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}
            />
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div
                className={`text-xs ${
                  isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                }`}
              >
                {item.description}
              </div>
            </div>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar para desktop */}
      <aside className="hidden flex-col border-r bg-white shadow-xl md:flex md:w-72">
        <div className="border-b bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h1 className="text-xl font-bold text-white">ComparAuto Admin</h1>
          <p className="mt-1 text-sm text-blue-100">Painel Administrativo</p>
        </div>
        <div className="flex-1 overflow-auto">{renderNavigation()}</div>
        <div className="mt-auto border-t bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <UserAvatar />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sair"
              className="text-muted-foreground hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center border-b bg-white px-6 shadow-sm">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-4">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                {
                  (
                    <>
                      <div className="border-b bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                        <h1 className="text-xl font-bold text-white">ComparAuto Admin</h1>
                        <p className="mt-1 text-sm text-blue-100">Painel Administrativo</p>
                      </div>
                      <div className="flex-1 overflow-auto">{renderNavigation()}</div>
                      <div className="mt-auto border-t bg-slate-50 p-4">
                        <Button variant="outline" className="w-full" onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sair
                        </Button>
                      </div>
                    </>
                  ) as React.ReactNode
                }
              </SheetContent>
            </Sheet>
          )}
          {onSearch && (
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="w-full border-slate-200 bg-slate-50 pl-10 focus:bg-white"
                onChange={e => onSearch(e.target.value)}
              />
            </div>
          )}
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:block">
              <span className="text-sm text-muted-foreground">
                Bem-vindo, <strong className="text-foreground">{adminName}</strong>
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-slate-100 hover:bg-slate-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        {/* Conteúdo da página */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
