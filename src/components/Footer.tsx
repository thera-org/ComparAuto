"use client";

import { Globe, Mail, Phone, MapPin, Heart, Star, Award, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-400 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-pink-400 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Content */}
      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Top Section - Brand and CTA */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-50"></div>
                <div className="relative bg-white rounded-full p-3 shadow-xl">
                  <Image
                    src="/logo.png"
                    alt="Logo ComparAuto"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                ComparAuto
              </h2>
            </div>
            
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Conectamos você à oficina perfeita para seu veículo. Qualidade, confiança e transparência em cada serviço.
            </p>
            
            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4 mx-auto">
                  <Award className="h-6 w-6 text-blue-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-gray-300">Oficinas Parceiras</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl mb-4 mx-auto">
                  <Star className="h-6 w-6 text-green-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">4.8★</div>
                <div className="text-sm text-gray-300">Avaliação Média</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-4 mx-auto">
                  <Heart className="h-6 w-6 text-purple-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">50k+</div>
                <div className="text-sm text-gray-300">Clientes Satisfeitos</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-xl mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-gray-300">Garantia</div>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* ComparAuto Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                ComparAuto
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/ajuda" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro-oficina" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                    Cadastre sua Oficina
                  </Link>
                </li>
                <li>
                  <Link href="/mensagens" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                    Central de Mensagens
                  </Link>
                </li>
              </ul>
            </div>

            {/* Conta Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Sua Conta
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                    Fazer Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <Link href="/conta" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                    Minha Conta
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                Contato
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:contato@comparauto.com" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-3 group">
                    <Mail className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform" />
                    contato@comparauto.com
                  </a>
                </li>
                <li>
                  <a href="tel:+5511999999999" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-3 group">
                    <Phone className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    (98) 98571-8468
                  </a>
                </li>
                <li>
                  <div className="text-gray-300 flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    São Luis, Maranhão
                  </div>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/termos" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <div className="text-gray-300 flex items-center gap-2">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                    © {new Date().getFullYear()} ComparAuto
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-sm text-gray-300">
                  Desenvolvido com <Heart className="inline h-4 w-4 text-red-400 mx-1" /> pela equipe ComparAuto
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Sistema online</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 border border-white/20">
                  <Globe className="h-4 w-4 text-blue-300" />
                  <span className="text-sm font-medium text-white">Português (BR)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
