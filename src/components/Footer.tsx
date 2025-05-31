"use client";

import Link from "next/link";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">ComparAuto</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:underline">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/ajuda" className="text-sm text-gray-600 hover:underline">
                  Ajuda
                </Link>
              </li>
              <li>
                <Link href="/cadastro-oficina" className="text-sm text-gray-600 hover:underline">
                  Cadastre sua oficina
                </Link>
              </li>
              <li>
                <Link href="/mensagens" className="text-sm text-gray-600 hover:underline">
                  Mensagens
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Conta</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className="text-sm text-gray-600 hover:underline">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-gray-600 hover:underline">
                  Criar conta
                </Link>
              </li>
              <li>
                <Link href="/conta" className="text-sm text-gray-600 hover:underline">
                  Minha conta
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Sobre</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contato@comparauto.com" className="text-sm text-gray-600 hover:underline">
                  contato@comparauto.com
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-600">© {new Date().getFullYear()} ComparAuto</span>
              </li>
              <li>
                <Link href="/ajuda" className="text-sm text-gray-600 hover:underline">
                  Termos de uso
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
            <p className="text-sm">Desenvolvido por ComparAuto</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Português (BR)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
