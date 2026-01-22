'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#F7F7F7]">
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-12">
        {/* Main Footer Grid */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Suporte */}
          <div>
            <h5 className="mb-4 font-bold text-gray-900">Suporte</h5>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link
                  href="/ajuda"
                  className="transition-colors hover:text-primary hover:underline"
                >
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  ComparAuto Cover para Oficinas
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Cancelamento
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Opções de cancelamento
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Denunciar um problema
                </Link>
              </li>
            </ul>
          </div>

          {/* Comunidade */}
          <div>
            <h5 className="mb-4 font-bold text-gray-900">Comunidade</h5>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  ComparAuto.org: ajuda em desastres
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Combate à discriminação
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Oficinas */}
          <div>
            <h5 className="mb-4 font-bold text-gray-900">Para Oficinas</h5>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link
                  href="/cadastro-oficina"
                  className="transition-colors hover:text-primary hover:underline"
                >
                  Cadastre sua oficina
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  ComparAuto Cover para mecânicos
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Recursos para oficinas
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Fórum da comunidade
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Hospedagem responsável
                </Link>
              </li>
            </ul>
          </div>

          {/* ComparAuto */}
          <div>
            <h5 className="mb-4 font-bold text-gray-900">ComparAuto</h5>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Newsroom
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Saiba mais sobre novos recursos
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Carta dos fundadores
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Carreiras
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary hover:underline">
                  Investidores
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between border-t border-gray-200 pt-6 text-sm text-gray-600 md:flex-row">
          {/* Left Side */}
          <div className="mb-4 flex flex-wrap justify-center gap-2 md:mb-0 md:justify-start">
            <span>© 2025 ComparAuto, Inc.</span>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="transition-colors hover:text-primary hover:underline">
              Privacidade
            </Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="transition-colors hover:text-primary hover:underline">
              Termos
            </Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="transition-colors hover:text-primary hover:underline">
              Mapa do site
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4 font-medium">
            <button className="flex items-center gap-1 transition-colors hover:text-primary hover:underline">
              <span className="material-icons text-base">language</span>
              Português (BR)
            </button>
            <button className="flex items-center gap-1 transition-colors hover:text-primary hover:underline">
              <span>R$</span>
              BRL
            </button>
            <div className="ml-2 flex gap-3">
              <a href="#" className="transition-colors hover:text-primary">
                <span className="material-icons text-lg">facebook</span>
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                <span className="material-icons text-lg">camera_alt</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
