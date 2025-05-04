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
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="ml-2 text-xl font-bold text-rose-500">ComparAuto</span>
        </Link>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <Link href="/cadastro-oficina">
            <Button className="bg-rose-500 hover:bg-rose-600">
              Cadastrar Oficina
            </Button>
          </Link>

          {user ? (
            <UserDropdown />
          ) : (
            <div className="relative">
              <div
                className="flex items-center border rounded-full p-1 shadow-sm cursor-pointer"
                onClick={toggleMenu}
              >
                <Menu className="h-5 w-5 mx-2" />
                <div className="h-8 w-8 bg-gray-500 rounded-full"></div>
              </div>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  <ul className="py-2">
                    <li>
                      <Link href="/login">
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                          Entrar
                        </button>
                      </Link>
                    </li>
                    <li>
                      <Link href="/signup">
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
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
      <div className="md:hidden px-4 pb-4">
        <Button variant="outline" className="w-full flex items-center justify-between rounded-full shadow-sm border">
          <div className="flex items-center">
            <Search className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-medium text-sm">Anywhere</div>
              <div className="text-xs text-gray-500">Any week · Add guests</div>
            </div>
          </div>
          <div className="border rounded-full p-2">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 8a3 3 0 0 1 6 0 3 3 0 0 1-6 0z" />
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
            </svg>
          </div>
        </Button>
      </div>
    </header>
  );
}
