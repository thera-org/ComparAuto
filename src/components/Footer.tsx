'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#F7F7F7] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Suporte */}
          <div>
            <h5 className="font-bold text-gray-900 mb-4">Suporte</h5>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/ajuda" className="hover:underline hover:text-primary transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  ComparAuto Cover para Oficinas
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Cancelamento
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Opções de cancelamento
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Denunciar um problema
                </Link>
              </li>
            </ul>
          </div>

          {/* Comunidade */}
          <div>
            <h5 className="font-bold text-gray-900 mb-4">Comunidade</h5>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  ComparAuto.org: ajuda em desastres
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Combate à discriminação
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Oficinas */}
          <div>
            <h5 className="font-bold text-gray-900 mb-4">Para Oficinas</h5>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/cadastro-oficina" className="hover:underline hover:text-primary transition-colors">
                  Cadastre sua oficina
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  ComparAuto Cover para mecânicos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Recursos para oficinas
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Fórum da comunidade
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Hospedagem responsável
                </Link>
              </li>
            </ul>
          </div>

          {/* ComparAuto */}
          <div>
            <h5 className="font-bold text-gray-900 mb-4">ComparAuto</h5>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Newsroom
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Saiba mais sobre novos recursos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Carta dos fundadores
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Carreiras
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline hover:text-primary transition-colors">
                  Investidores
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          {/* Left Side */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4 md:mb-0">
            <span>© 2025 ComparAuto, Inc.</span>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:underline hover:text-primary transition-colors">
              Privacidade
            </Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:underline hover:text-primary transition-colors">
              Termos
            </Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:underline hover:text-primary transition-colors">
              Mapa do site
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4 font-medium">
            <button className="flex items-center gap-1 hover:underline hover:text-primary transition-colors">
              <span className="material-icons text-base">language</span>
              Português (BR)
            </button>
            <button className="flex items-center gap-1 hover:underline hover:text-primary transition-colors">
              <span>R$</span>
              BRL
            </button>
            <div className="flex gap-3 ml-2">
              <a href="#" className="hover:text-primary transition-colors">
                <span className="material-icons text-lg">facebook</span>
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <span className="material-icons text-lg">camera_alt</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
