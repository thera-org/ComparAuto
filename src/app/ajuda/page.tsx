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
        <section className="border-b  border-gray-200 bg-[#F7F7F7] px-6 py-16 ">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-8 text-3xl font-bold text-gray-900  md:text-4xl">
              Como podemos ajudar?
            </h1>
            <div className="relative mx-auto max-w-2xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="material-icons text-gray-500">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white py-4 pl-12  pr-4 text-lg text-gray-900 placeholder-gray-500 shadow-sm  transition-shadow  hover:shadow-md  focus:border-primary focus:ring focus:ring-primary/20"
                placeholder="Buscar por dúvidas, artigos ou tópicos..."
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 flex text-sm  text-gray-500">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className=":text-white inline-flex items-center hover:text-gray-900">
                  <span className="material-icons mr-2 text-sm">home</span>
                  Início
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-icons mx-1 text-sm text-gray-400">chevron_right</span>
                  <span className="font-medium text-gray-900 ">Central de Ajuda</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Topics Grid */}
          <section className="mb-16">
            <h2 className="mb-6 text-xl font-semibold  text-gray-900">Navegue por tópicos</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {TOPICOS.map(topico => (
                <Link
                  key={topico.id}
                  href={`#${topico.id}`}
                  className=":border-gray-600 group rounded-xl border  border-gray-200 bg-white p-6 transition duration-200 hover:border-gray-300 hover:shadow-lg "
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition group-hover:bg-primary/20">
                    <span className="material-icons-outlined text-2xl text-primary">
                      {topico.icon}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold  text-gray-900">{topico.title}</h3>
                  <p className="text-sm text-gray-500 ">{topico.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Articles Section */}
          <section className="mb-12">
            <h2 className="mb-6 text-xl font-semibold  text-gray-900">Artigos Recomendados</h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
              {ARTIGOS.map((artigo, index) => (
                <Link
                  key={index}
                  href={artigo.href}
                  className=":bg-surface-dark group flex items-center justify-between rounded-lg p-4 transition hover:bg-[#F7F7F7]"
                >
                  <span className="text-gray-700  transition-colors group-hover:text-primary">
                    {artigo.title}
                  </span>
                  <span className="material-icons text-sm text-gray-400 transition-transform group-hover:translate-x-1">
                    arrow_forward_ios
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="rounded-2xl  border border-gray-200 bg-[#F7F7F7] p-8 text-center md:p-12 ">
            <h3 className="mb-3 text-2xl font-semibold  text-gray-900">
              Não encontrou o que procurava?
            </h3>
            <p className="mx-auto  mb-8 max-w-2xl text-gray-600">
              Nossa equipe de especialistas está disponível para ajudar você com qualquer problema
              relacionado à plataforma ou serviços de oficinas.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover">
                Abrir Chamado
              </button>
              <button className=":bg-gray-700 rounded-lg border  border-gray-300 bg-white  px-6  py-3 font-medium text-gray-900 transition hover:bg-gray-50">
                Chat Online
              </button>
            </div>
          </section>

          {/* Contact Info Box */}
          <div className="mt-12 rounded-xl border  border-gray-200 bg-white p-6  shadow-sm">
            <h4 className="mb-6 flex items-center  gap-2 text-lg font-bold text-gray-900">
              <span className="material-icons text-primary">support_agent</span>
              Fale Conosco
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-100  p-2">
                  <span className="material-icons text-sm  text-gray-600">email</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Email</p>
                  <a
                    href="mailto:suporte@comparauto.com.br"
                    className="font-medium  text-gray-900 transition hover:text-primary"
                  >
                    suporte@comparauto.com.br
                  </a>
                  <p className="mt-1 text-xs text-gray-500">Tempo de resposta: até 24h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-100  p-2">
                  <span className="material-icons text-sm  text-gray-600">phone</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Telefone
                  </p>
                  <a
                    href="tel:08001234567"
                    className="font-medium  text-gray-900 transition hover:text-primary"
                  >
                    0800 123 4567
                  </a>
                  <p className="mt-1 text-xs text-gray-500">Segunda a Sexta, 08h às 18h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-100  p-2">
                  <span className="material-icons text-sm  text-gray-600">chat</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Chat ao Vivo
                  </p>
                  <button className="text-left  font-medium text-gray-900 transition hover:text-primary">
                    Iniciar conversa
                  </button>
                  <p className="mt-1 text-xs text-gray-500">Disponível agora</p>
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
