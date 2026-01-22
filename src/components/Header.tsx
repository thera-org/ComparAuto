'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

import { UserDropdown } from './UserDropdown'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="fixed w-full top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-primary material-icons-outlined text-3xl">build_circle</span>
          <span className="text-primary text-xl font-bold tracking-tight">ComparAuto</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow py-2.5 px-4 gap-4 divide-x divide-gray-300">
          <button className="text-sm font-medium px-2 text-gray-900 truncate">Qualquer serviço</button>
          <button className="text-sm font-medium px-2 text-gray-900 truncate">Localização</button>
          <button className="text-sm text-gray-500 px-2 flex items-center gap-2">
            Filtros
            <div className="bg-primary p-2 rounded-full text-white flex items-center justify-center">
              <span className="material-icons text-sm">search</span>
            </div>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* CTA Button */}
          <Link
            href="/cadastro-oficina"
            className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-2 rounded-full transition"
          >
            Cadastrar sua Oficina
          </Link>

          {/* Language Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <span className="material-icons-outlined text-gray-600">language</span>
          </button>

          {/* User Menu */}
          {user ? (
            <UserDropdown />
          ) : (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="flex items-center gap-2 border border-gray-300 rounded-full p-1 pl-3 hover:shadow-md transition"
                aria-label="Menu do usuário"
              >
                <span className="material-icons text-gray-600">menu</span>
                <div className="bg-gray-500 text-white rounded-full p-1">
                  <span className="material-icons text-xl">account_circle</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                  <div className="py-2">
                    <Link href="/login">
                      <button className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
                        Entrar
                      </button>
                    </Link>
                    <Link href="/signup">
                      <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        Cadastre-se
                      </button>
                    </Link>
                  </div>
                  <div className="border-t border-gray-200 py-2">
                    <Link href="/cadastro-oficina">
                      <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        Cadastrar sua Oficina
                      </button>
                    </Link>
                    <Link href="/ajuda">
                      <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        Ajuda
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Section */}
      <div className="md:hidden mt-4">
        <button className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow py-3 px-4">
          <div className="flex items-center gap-3">
            <span className="material-icons text-primary">search</span>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">Buscar oficinas</div>
              <div className="text-xs text-gray-500">Qualquer serviço · Localização</div>
            </div>
          </div>
          <div className="p-2 border border-gray-300 rounded-full">
            <span className="material-icons text-gray-600 text-sm">tune</span>
          </div>
        </button>
      </div>
    </header>
  )
}
