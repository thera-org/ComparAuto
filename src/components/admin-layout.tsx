'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type React from 'react'

import UserAvatar from '@/app/admin/user-avatar'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    const getAdminData = async () => {
      const { data: { session } } = await supabase.auth.getSession()

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
    localStorage.removeItem('admin')
    localStorage.removeItem('adminData')
    window.location.href = '/admin/login'
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'dashboard', description: 'Visão geral' },
    { href: '/admin/usuarios', label: 'Usuários', icon: 'people', description: 'Gerenciar usuários' },
    { href: '/admin/oficinas', label: 'Oficinas', icon: 'build', description: 'Gerenciar oficinas' },
  ]

  const renderNavigation = () => (
    <nav className="space-y-1 py-4 px-3">
      {navItems.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
              isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-gray-600  hover:bg-gray-100 :bg-gray-800'
            }`}
          >
            <span className={`material-icons-outlined text-xl ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>{item.description}</div>
            </div>
            {isActive && <span className="material-icons text-white/70 text-sm">chevron_right</span>}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-white ">
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-72 flex flex-col
        bg-white  border-r border-gray-200  shadow-xl
        transition-transform duration-300
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-icons text-white">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 ">ComparAuto</h1>
              <p className="text-xs text-gray-500 ">Painel Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto">{renderNavigation()}</div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200  bg-[#F7F7F7] ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar />
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900  truncate max-w-[120px]">{adminName}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sair"
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 :bg-red-900/20 rounded-lg transition"
            >
              <span className="material-icons">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-6 bg-white  border-b border-gray-200  shadow-sm">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 mr-4 text-gray-500 hover:text-gray-700 :text-gray-300 hover:bg-gray-100 :bg-gray-800 rounded-lg transition"
            >
              <span className="material-icons">menu</span>
            </button>
          )}

          {/* Search */}
          {onSearch && (
            <div className="relative flex-1 max-w-md">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
              <input
                type="search"
                placeholder={searchPlaceholder}
                onChange={e => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F7]  border border-gray-200  rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
            </div>
          )}

          {/* Right Section */}
          <div className="ml-auto flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 :text-gray-300 hover:bg-gray-100 :bg-gray-800 rounded-lg transition">
              <span className="material-icons-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-200 ">
              <span className="text-sm text-gray-500 ">
                Olá, <strong className="text-gray-900 ">{adminName}</strong>
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600  hover:text-red-600 :text-red-400 hover:bg-red-50 :bg-red-900/20 rounded-lg transition"
            >
              <span className="material-icons text-lg">logout</span>
              Sair
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
