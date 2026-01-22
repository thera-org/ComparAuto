'use client'

import Link from 'next/link'
import { useState } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

const TOPICOS = [
  {
    id: 'agendamentos',
    title: 'Agendamentos',
    description: 'Alterar datas, cancelamentos e status de serviços.',
    icon: 'calendar_month',
  },
  {
    id: 'pagamentos',
    title: 'Pagamentos',
    description: 'Reembolsos, faturas e métodos de pagamento aceitos.',
    icon: 'payments',
  },
  {
    id: 'oficinas',
    title: 'Para Oficinas',
    description: 'Gestão de perfil, cadastro de serviços e suporte técnico.',
    icon: 'storefront',
  },
  {
    id: 'seguranca',
    title: 'Segurança',
    description: 'Proteção da conta, denúncias e garantia dos serviços.',
    icon: 'security',
  },
]

const ARTIGOS = [
  { title: 'Como funciona o reembolso?', href: '#' },
  { title: 'Política de cancelamento de oficinas', href: '#' },
  { title: 'Redefinir senha da conta', href: '#' },
  { title: 'Como entrar em contato com a oficina?', href: '#' },
  { title: 'Cadastrar novo veículo no perfil', href: '#' },
  { title: 'Denunciar comportamento inadequado', href: '#' },
]

export default function AjudaPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex min-h-screen flex-col bg-white  text-gray-800 ">
      <Header />

      <main className="flex-grow pt-6">
        {/* Hero Section */}
        <section className="bg-[#F7F7F7]  py-16 px-6 border-b border-gray-200 ">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900  mb-8">
              Como podemos ajudar?
            </h1>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-icons text-gray-500">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300  shadow-sm focus:border-primary focus:ring focus:ring-primary/20 bg-white  text-gray-900  placeholder-gray-500  text-lg transition-shadow hover:shadow-md"
                placeholder="Buscar por dúvidas, artigos ou tópicos..."
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="flex text-sm text-gray-500  mb-8">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center hover:text-gray-900 :text-white">
                  <span className="material-icons text-sm mr-2">home</span>
                  Início
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-icons text-sm text-gray-400 mx-1">chevron_right</span>
                  <span className="font-medium text-gray-900 ">Central de Ajuda</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Topics Grid */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-gray-900  mb-6">Navegue por tópicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TOPICOS.map((topico) => (
                <Link
                  key={topico.id}
                  href={`#${topico.id}`}
                  className="group p-6 border border-gray-200  rounded-xl hover:shadow-lg hover:border-gray-300 :border-gray-600 transition duration-200 bg-white "
                >
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                    <span className="material-icons-outlined text-primary text-2xl">{topico.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900  mb-2">{topico.title}</h3>
                  <p className="text-sm text-gray-500 ">{topico.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Articles Section */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900  mb-6">Artigos Recomendados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {ARTIGOS.map((artigo, index) => (
                <Link
                  key={index}
                  href={artigo.href}
                  className="flex justify-between items-center p-4 rounded-lg hover:bg-[#F7F7F7] :bg-surface-dark transition group"
                >
                  <span className="text-gray-700  group-hover:text-primary transition-colors">
                    {artigo.title}
                  </span>
                  <span className="material-icons text-gray-400 text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward_ios
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-[#F7F7F7]  rounded-2xl p-8 md:p-12 text-center border border-gray-200 ">
            <h3 className="text-2xl font-semibold text-gray-900  mb-3">
              Não encontrou o que procurava?
            </h3>
            <p className="text-gray-600  mb-8 max-w-2xl mx-auto">
              Nossa equipe de especialistas está disponível para ajudar você com qualquer problema relacionado à plataforma ou serviços de oficinas.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition shadow-lg shadow-primary/30">
                Abrir Chamado
              </button>
              <button className="px-6 py-3 bg-white  border border-gray-300  text-gray-900  font-medium rounded-lg hover:bg-gray-50 :bg-gray-700 transition">
                Chat Online
              </button>
            </div>
          </section>

          {/* Contact Info Box */}
          <div className="mt-12 p-6 bg-white  rounded-xl border border-gray-200  shadow-sm">
            <h4 className="text-lg font-bold text-gray-900  mb-6 flex items-center gap-2">
              <span className="material-icons text-primary">support_agent</span>
              Fale Conosco
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100  rounded-full">
                  <span className="material-icons text-gray-600  text-sm">email</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</p>
                  <a href="mailto:suporte@comparauto.com.br" className="text-gray-900  font-medium hover:text-primary transition">
                    suporte@comparauto.com.br
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Tempo de resposta: até 24h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100  rounded-full">
                  <span className="material-icons text-gray-600  text-sm">phone</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Telefone</p>
                  <a href="tel:08001234567" className="text-gray-900  font-medium hover:text-primary transition">
                    0800 123 4567
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Segunda a Sexta, 08h às 18h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100  rounded-full">
                  <span className="material-icons text-gray-600  text-sm">chat</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Chat ao Vivo</p>
                  <button className="text-gray-900  font-medium hover:text-primary transition text-left">
                    Iniciar conversa
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Disponível agora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
