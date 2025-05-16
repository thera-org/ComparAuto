"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import UserAvatar from "@/app/admin/user-avatar"
import { LayoutDashboard, Users, Wrench, Menu, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import AdminAuthGate from "@/components/AdminAuthGate"

interface AdminLayoutProps {
  children: React.ReactNode
  searchPlaceholder?: string
  onSearch?: (term: string) => void
}

export default function AdminLayout({ children, searchPlaceholder = "Buscar...", onSearch }: AdminLayoutProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
    { href: "/admin/oficinas", label: "Oficinas", icon: Wrench },
  ]

  const renderNavigation = () => (
    <nav className="space-y-1 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar para desktop */}
        <aside className="hidden md:flex md:w-64 flex-col bg-white border-r shadow-sm">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          </div>

          <div className="flex-1 overflow-auto">{renderNavigation()}</div>

          <div className="p-4 border-t mt-auto">
            <div className="flex items-center justify-between">
              <UserAvatar />
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b h-16 flex items-center px-4 shadow-sm">
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-4">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  {(
                    <>
                      <div className="p-4 border-b">
                        <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
                      </div>
                      <div className="flex-1 overflow-auto">{renderNavigation()}</div>
                      <div className="p-4 border-t mt-auto">
                        <Button variant="outline" className="w-full" onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sair
                        </Button>
                      </div>
                    </>
                  ) as React.ReactNode}
                </SheetContent>
              </Sheet>
            )}

            {onSearch && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="pl-8 w-full"
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            )}

            <div className="ml-auto">
              <UserAvatar />
            </div>
          </header>

          {/* Conteúdo da página */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </AdminAuthGate>
  )
}
