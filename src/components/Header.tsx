'use client'

import type { User } from '@supabase/supabase-js'
import { Search, Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

import { UserDropdown } from './UserDropdown'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/95 shadow-lg backdrop-blur-lg transition-all">
      {/* Gradient overlay for modern effect */}
      <div className="via-purple-600/3 absolute inset-0 bg-gradient-to-r from-blue-600/5 to-pink-600/5"></div>
      <div className="container relative mx-auto flex items-center justify-between gap-2 px-4 py-3 sm:gap-4">
        {/* Enhanced Logo and Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:gap-3"
          aria-label="Página inicial ComparAuto"
        >
          <div className="relative">
            {/* Animated logo container with gradient border */}
            <div className="absolute inset-0 scale-110 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-30"></div>
            <div className="relative flex items-center justify-center rounded-full border-2 border-yellow-400 bg-white p-1.5 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-yellow-500 group-hover:shadow-xl sm:p-2">
              <Image
                src="/logo.png"
                alt="Logo ComparAuto"
                width={32}
                height={32}
                className="h-8 w-8 object-contain sm:h-10 sm:w-10"
              />
            </div>
          </div>

          {/* Enhanced brand text with gradient */}
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-lg font-black tracking-tight text-transparent drop-shadow-sm sm:text-2xl">
              ComparAuto
            </span>
            <span className="-mt-1 hidden text-xs font-medium text-gray-500 sm:block">
              Sua oficina ideal
            </span>
          </div>
        </Link>{' '}
        {/* Enhanced Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Enhanced CTA Button */}
          <Link href="/cadastro-oficina" className="hidden sm:block">
            <Button className="group relative transform overflow-hidden rounded-full border-2 border-yellow-300 bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 text-xs font-bold text-blue-900 shadow-lg transition-all duration-300 hover:scale-105 hover:border-yellow-400 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-xl sm:px-6 sm:py-2.5 sm:text-sm">
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
              <span className="relative flex items-center gap-1 sm:gap-2">
                <span>✨ Cadastrar</span>
              </span>
            </Button>
          </Link>

          {/* Mobile CTA Button */}
          <Link href="/cadastro-oficina" className="sm:hidden">
            <Button className="group relative transform overflow-hidden rounded-full border-2 border-yellow-300 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-2 text-xs font-bold text-blue-900 shadow-lg transition-all duration-300 hover:scale-105 hover:border-yellow-400 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-xl">
              <span className="relative">✨</span>
            </Button>
          </Link>

          {/* Enhanced User Section */}
          {user ? (
            <UserDropdown />
          ) : (
            <div className="relative">
              <button
                className="group flex cursor-pointer items-center rounded-full border border-gray-200 bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl"
                onClick={toggleMenu}
                aria-label="Abrir menu de usuário"
              >
                <Menu className="mx-1 h-5 w-5 text-blue-700 transition-colors group-hover:text-blue-800" />
                <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 transition-transform group-hover:scale-110">
                  <Image
                    src="/globe.svg"
                    alt="Avatar"
                    width={20}
                    height={20}
                    className="h-5 w-5 opacity-80"
                  />
                </div>
              </button>

              {/* Enhanced Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 z-50 mt-3 w-52 animate-fade-in-up overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl backdrop-blur-lg">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>

                  <div className="relative">
                    {/* Header */}
                    <div className="border-b border-gray-100 bg-gradient-to-r from-blue-600/5 to-purple-600/5 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-700">Bem-vindo ao ComparAuto</p>
                      <p className="text-xs text-gray-500">Faça login para continuar</p>
                    </div>

                    <ul className="py-2">
                      <li>
                        <Link href="/login">
                          <button className="mx-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-blue-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            Entrar
                          </button>
                        </Link>
                      </li>
                      <li>
                        <Link href="/signup">
                          <button className="mx-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-purple-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            Cadastre-se
                          </button>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>{' '}
      {/* Enhanced Mobile Search Section */}
      <div className="px-4 pb-3 md:hidden">
        <Button
          variant="outline"
          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white/90 p-3 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl"
        >
          <div className="flex items-center">
            <div className="mr-3 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-1.5">
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-blue-900">Buscar oficinas</div>
              <div className="text-xs text-blue-500">Filtre por serviço, local...</div>
            </div>
          </div>
          <div className="rounded-full border border-yellow-300 bg-gradient-to-br from-yellow-100 to-yellow-200 p-1.5">
            <svg className="h-4 w-4 text-blue-700" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 8a3 3 0 0 1 6 0 3 3 0 0 1-6 0z" />
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
            </svg>
          </div>
        </Button>
      </div>
    </header>
  )
}
