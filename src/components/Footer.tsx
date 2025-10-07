'use client'

import { Globe, Mail, Phone, MapPin, Heart, Star, Award, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-10 top-10 h-20 w-20 animate-pulse rounded-full bg-blue-400 blur-xl"></div>
        <div
          className="absolute right-20 top-32 h-16 w-16 animate-pulse rounded-full bg-purple-400 blur-xl"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 h-24 w-24 animate-pulse rounded-full bg-pink-400 blur-xl"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Top Section - Brand and CTA */}
          <div className="mb-12 text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-50 blur-lg"></div>
                <div className="relative rounded-full bg-white p-3 shadow-xl">
                  <Image
                    src="/logo.png"
                    alt="Logo ComparAuto"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                </div>
              </div>
              <h2 className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-3xl font-black text-transparent">
                ComparAuto
              </h2>
            </div>

            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-300">
              Conectamos você à oficina perfeita para seu veículo. Qualidade, confiança e
              transparência em cada serviço.
            </p>

            {/* Stats Section */}
            <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                  <Award className="h-6 w-6 text-blue-300" />
                </div>
                <div className="mb-1 text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-300">Oficinas Parceiras</div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                  <Star className="h-6 w-6 text-green-300" />
                </div>
                <div className="mb-1 text-2xl font-bold text-white">4.8★</div>
                <div className="text-sm text-gray-300">Avaliação Média</div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                  <Heart className="h-6 w-6 text-purple-300" />
                </div>
                <div className="mb-1 text-2xl font-bold text-white">50k+</div>
                <div className="text-sm text-gray-300">Clientes Satisfeitos</div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20">
                  <Shield className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="mb-1 text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-gray-300">Garantia</div>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* ComparAuto Section */}
            <div className="space-y-4">
              <h3 className="mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-xl font-bold text-transparent">
                ComparAuto
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="group flex items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <div className="h-1 w-1 rounded-full bg-blue-400 transition-all duration-200 group-hover:w-2"></div>
                    Início
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ajuda"
                    className="group flex items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <div className="h-1 w-1 rounded-full bg-blue-400 transition-all duration-200 group-hover:w-2"></div>
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cadastro-oficina"
                    className="group flex items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <div className="h-1 w-1 rounded-full bg-blue-400 transition-all duration-200 group-hover:w-2"></div>
                    Cadastre sua Oficina
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mensagens"
                    className="group flex items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <div className="h-1 w-1 rounded-full bg-blue-400 transition-all duration-200 group-hover:w-2"></div>
                    Central de Mensagens
                  </Link>
                </li>
              </ul>
            </div>

            {/* Conta Section */}
            <div className="space-y-4">
              <h3 className="mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-xl font-bold text-transparent">
                Sua Conta
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/login"
                    className="group flex items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <div className="h-1 w-1 rounded-full bg-purple-400 transition-all duration-200 group-hover:w-2"></div>
                    Fazer Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="group flex items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <div className="h-1 w-1 rounded-full bg-purple-400 transition-all duration-200 group-hover:w-2"></div>
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <Link
                    href="/conta"
                    className="group flex items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <div className="h-1 w-1 rounded-full bg-purple-400 transition-all duration-200 group-hover:w-2"></div>
                    Minha Conta
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato Section */}
            <div className="space-y-4">
              <h3 className="mb-6 bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-xl font-bold text-transparent">
                Contato
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:contato@comparauto.com"
                    className="group flex items-center gap-3 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <Mail className="h-4 w-4 text-green-400 transition-transform group-hover:scale-110" />
                    contato@comparauto.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+5511999999999"
                    className="group flex items-center gap-3 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <Phone className="h-4 w-4 text-blue-400 transition-transform group-hover:scale-110" />
                    (98) 98571-8468
                  </a>
                </li>
                <li>
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    São Luis, Maranhão
                  </div>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div className="space-y-4">
              <h3 className="mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-xl font-bold text-transparent">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/termos"
                    className="group flex items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <div className="h-1 w-1 rounded-full bg-yellow-400 transition-all duration-200 group-hover:w-2"></div>
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacidade"
                    className="group flex items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <div className="h-1 w-1 rounded-full bg-yellow-400 transition-all duration-200 group-hover:w-2"></div>
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="h-1 w-1 rounded-full bg-yellow-400"></div>©{' '}
                    {new Date().getFullYear()} ComparAuto
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex flex-col items-center gap-4 md:flex-row">
                <p className="text-sm text-gray-300">
                  Desenvolvido com <Heart className="mx-1 inline h-4 w-4 text-red-400" /> pela
                  equipe ComparAuto
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                  <span className="text-xs text-gray-400">Sistema online</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  <Globe className="h-4 w-4 text-blue-300" />
                  <span className="text-sm font-medium text-white">Português (BR)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
