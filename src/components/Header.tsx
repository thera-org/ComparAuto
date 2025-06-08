"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from '@/components/ui/button';
import { Search, Menu } from "lucide-react";
import { UserDropdown } from "./UserDropdown";
import { supabase } from "@/lib/supabase";
import type { User } from '@supabase/supabase-js';
import Image from "next/image";


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg transition-all">
      {/* Gradient overlay for modern effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/3 to-pink-600/5"></div>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2 sm:gap-4 relative">
        {/* Enhanced Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl" aria-label="Página inicial ComparAuto">
          <div className="relative">
            {/* Animated logo container with gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse opacity-30 scale-110"></div>
            <div className="relative rounded-full bg-white p-1.5 sm:p-2 shadow-lg border-2 border-yellow-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:border-yellow-500">
              <Image
                src="/logo.png"
                alt="Logo ComparAuto"
                width={32}
                height={32}
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
            </div>
          </div>
          
          {/* Enhanced brand text with gradient */}
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-transparent drop-shadow-sm">
              ComparAuto
            </span>
            <span className="text-xs text-gray-500 font-medium -mt-1 hidden sm:block">Sua oficina ideal</span>
          </div>
        </Link>        {/* Enhanced Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Enhanced CTA Button */}
          <Link href="/cadastro-oficina" className="hidden sm:block">
            <Button className="relative overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-bold rounded-full shadow-lg hover:shadow-xl px-4 sm:px-6 py-2 sm:py-2.5 border-2 border-yellow-300 hover:border-yellow-400 text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 group">
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative flex items-center gap-1 sm:gap-2">
                <span>✨ Cadastrar</span>
              </span>
            </Button>
          </Link>
          
          {/* Mobile CTA Button */}
          <Link href="/cadastro-oficina" className="sm:hidden">
            <Button className="relative overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-bold rounded-full shadow-lg hover:shadow-xl px-3 py-2 border-2 border-yellow-300 hover:border-yellow-400 text-xs transition-all duration-300 transform hover:scale-105 group">
              <span className="relative">✨</span>
            </Button>
          </Link>

          {/* Enhanced User Section */}
          {user ? (
            <UserDropdown />
          ) : (
            <div className="relative">
              <button
                className="flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full p-2 shadow-lg cursor-pointer hover:bg-white hover:shadow-xl transition-all duration-300 group"
                onClick={toggleMenu}
                aria-label="Abrir menu de usuário"
              >
                <Menu className="h-5 w-5 mx-1 text-blue-700 group-hover:text-blue-800 transition-colors" />
                <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center ml-1 group-hover:scale-110 transition-transform">
                  <Image src="/globe.svg" alt="Avatar" width={20} height={20} className="h-5 w-5 opacity-80" />
                </div>
              </button>
              
              {/* Enhanced Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-2xl animate-fade-in-up z-50 overflow-hidden">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
                      <p className="text-sm font-semibold text-gray-700">Bem-vindo ao ComparAuto</p>
                      <p className="text-xs text-gray-500">Faça login para continuar</p>
                    </div>
                    
                    <ul className="py-2">
                      <li>
                        <Link href="/login">
                          <button className="w-full text-left px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg mx-2 transition-all duration-200 flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Entrar
                          </button>
                        </Link>
                      </li>
                      <li>
                        <Link href="/signup">
                          <button className="w-full text-left px-4 py-3 text-sm font-semibold text-purple-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg mx-2 transition-all duration-200 flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
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
      </div>      {/* Enhanced Mobile Search Section */}
      <div className="md:hidden px-4 pb-3">
        <Button variant="outline" className="w-full flex items-center justify-between rounded-2xl shadow-lg border border-gray-200 bg-white/90 hover:bg-white hover:shadow-xl transition-all duration-300 p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mr-3">
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm text-blue-900">Buscar oficinas</div>
              <div className="text-xs text-blue-500">Filtre por serviço, local...</div>
            </div>
          </div>
          <div className="p-1.5 bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-300 rounded-full">
            <svg className="h-4 w-4 text-blue-700" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 8a3 3 0 0 1 6 0 3 3 0 0 1-6 0z" />
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
            </svg>
          </div>
        </Button>
      </div>
    </header>
  );
}
