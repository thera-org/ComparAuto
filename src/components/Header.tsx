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
    <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="material-icons-outlined text-3xl text-primary">build_circle</span>
          <span className="text-xl font-bold tracking-tight text-primary">ComparAuto</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden items-center gap-4 divide-x divide-gray-300 rounded-full border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition-shadow hover:shadow-md md:flex">
          <button className="truncate px-2 text-sm font-medium text-gray-900">
            Qualquer serviço
          </button>
          <button className="truncate px-2 text-sm font-medium text-gray-900">Localização</button>
          <button className="flex items-center gap-2 px-2 text-sm text-gray-500">
            Filtros
            <div className="flex items-center justify-center rounded-full bg-primary p-2 text-white">
              <span className="material-icons text-sm">search</span>
            </div>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* CTA Button */}
          <Link
            href="/cadastro-oficina"
            className="hidden rounded-full px-4 py-2 text-sm font-medium transition hover:bg-gray-100 md:block"
          >
            Cadastrar sua Oficina
          </Link>

          {/* Language Button */}
          <button className="rounded-full p-2 transition hover:bg-gray-100">
            <span className="material-icons-outlined text-gray-600">language</span>
          </button>

          {/* User Menu */}
          {user ? (
            <UserDropdown />
          ) : (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="flex items-center gap-2 rounded-full border border-gray-300 p-1 pl-3 transition hover:shadow-md"
                aria-label="Menu do usuário"
              >
                <span className="material-icons text-gray-600">menu</span>
                <div className="rounded-full bg-gray-500 p-1 text-white">
                  <span className="material-icons text-xl">account_circle</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="py-2">
                    <Link href="/login">
                      <button className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100">
                        Entrar
                      </button>
                    </Link>
                    <Link href="/signup">
                      <button className="w-full px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100">
                        Cadastre-se
                      </button>
                    </Link>
                  </div>
                  <div className="border-t border-gray-200 py-2">
                    <Link href="/cadastro-oficina">
                      <button className="w-full px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100">
                        Cadastrar sua Oficina
                      </button>
                    </Link>
                    <Link href="/ajuda">
                      <button className="w-full px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100">
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
      <div className="mt-4 md:hidden">
        <button className="flex w-full items-center justify-between rounded-full border border-gray-300 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="material-icons text-primary">search</span>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">Buscar oficinas</div>
              <div className="text-xs text-gray-500">Qualquer serviço · Localização</div>
            </div>
          </div>
          <div className="rounded-full border border-gray-300 p-2">
            <span className="material-icons text-sm text-gray-600">tune</span>
          </div>
        </button>
      </div>
    </header>
  )
}
