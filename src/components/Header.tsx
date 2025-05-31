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

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur border-b border-blue-100/60 shadow-md transition-all">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Logo e Nome */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none" aria-label="Página inicial ComparAuto">
          <div className="rounded-full bg-white p-1.5 shadow border-2 border-yellow-400 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Logo ComparAuto"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <span className="ml-1 text-3xl font-extrabold tracking-tight text-black drop-shadow-sm flex items-end" style={{letterSpacing: '0.01em'}}>
            ComparAuto
          </span>
        </Link>
        {/* Botão e Menu */}
        <div className="flex items-center gap-3">
          <Link href="/cadastro-oficina">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold rounded-full shadow px-5 py-2 border border-blue-100 text-base transition-all">
              Cadastrar Oficina
            </Button>
          </Link>
          {user ? (
            <UserDropdown />
          ) : (
            <div className="relative">
              <button
                className="flex items-center border border-blue-100 rounded-full p-2 shadow-sm cursor-pointer bg-white hover:bg-blue-50 transition-all"
                onClick={toggleMenu}
                aria-label="Abrir menu de usuário"
              >
                <Menu className="h-5 w-5 mx-1 text-blue-700" />
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center ml-1">
                  <Image src="/globe.svg" alt="Avatar" width={22} height={22} className="h-5 w-5 opacity-70" />
                </div>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-blue-100 rounded-xl shadow-lg animate-fade-in-up z-50">
                  <ul className="py-2">
                    <li>
                      <Link href="/login">
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-blue-800 hover:bg-yellow-50 rounded-lg transition-all">
                          Entrar
                        </button>
                      </Link>
                    </li>
                    <li>
                      <Link href="/signup">
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-blue-800 hover:bg-yellow-50 rounded-lg transition-all">
                          Cadastre-se
                        </button>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <Button variant="outline" className="w-full flex items-center justify-between rounded-full shadow border border-blue-100 bg-white/90">
          <div className="flex items-center">
            <Search className="h-4 w-4 mr-2 text-blue-400" />
            <div className="text-left">
              <div className="font-medium text-sm text-blue-900">Buscar oficinas</div>
              <div className="text-xs text-blue-400">Filtre por serviço, local...</div>
            </div>
          </div>
          <div className="border rounded-full p-2 bg-yellow-100 border-yellow-300">
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
