'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'

const FEATURES = [
  {
    icon: 'visibility',
    title: 'Visibilidade Nacional',
    description:
      'Sua oficina aparece para milhares de motoristas buscando serviços automotivos na sua região.',
  },
  {
    icon: 'star',
    title: 'Avaliações Reais',
    description: 'Ganhe reputação com avaliações de clientes e destaque-se da concorrência.',
  },
  {
    icon: 'dashboard',
    title: 'Gestão Facilitada',
    description:
      'Gerencie informações, horários e serviços da sua oficina de forma simples e rápida.',
  },
  {
    icon: 'payments',
    title: 'Aumente seu Faturamento',
    description: 'Receba novos clientes todos os dias e veja seu negócio crescer.',
  },
]

const STEPS = [
  {
    icon: 'edit_note',
    title: 'Cadastro',
    description: 'Preencha seus dados e informações da oficina.',
  },
  {
    icon: 'verified',
    title: 'Aprovação',
    description: 'Nosso time valida e publica sua oficina na plataforma.',
  },
  {
    icon: 'people',
    title: 'Novos Clientes',
    description: 'Receba solicitações e aumente seu faturamento.',
  },
  {
    icon: 'insights',
    title: 'Gestão Fácil',
    description: 'Atualize seus dados e acompanhe avaliações em tempo real.',
  },
]

const TESTIMONIALS = [
  {
    name: 'João Silva',
    role: 'Oficina do João',
    text: 'Depois que entrei na ComparAuto, minha oficina nunca ficou vazia. Os clientes chegam já confiando no nosso trabalho!',
    rating: 5,
  },
  {
    name: 'Maria Santos',
    role: 'Auto Center MS',
    text: 'A plataforma é muito fácil de usar. Consigo gerenciar meus agendamentos e responder clientes rapidamente.',
    rating: 5,
  },
  {
    name: 'Carlos Oliveira',
    role: 'Mecânica Oliveira',
    text: 'Em 3 meses já recuperei o investimento inicial. Recomendo para todas as oficinas!',
    rating: 5,
  },
]

export default function CadastroOficina() {
  const router = useRouter()

  async function handleCadastroClick(e: React.MouseEvent) {
    e.preventDefault()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      // Not logged in, redirect to login with redirect param
      router.push('/login?redirect=/cadastro-oficina/formulario')
    } else {
      router.push('/cadastro-oficina/formulario')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pb-24 pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className="text-center md:text-left">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <span className="material-icons text-sm">trending_up</span>
                  Mais de 500 oficinas já confiam na ComparAuto
                </span>
                <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                  Sua oficina no <span className="text-primary">topo do Brasil!</span>
                </h1>
                <p className="mb-8 max-w-xl text-lg text-gray-600">
                  Cadastre sua oficina na ComparAuto e conquiste novos clientes todos os dias.
                  Visibilidade, confiança e crescimento para o seu negócio!
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                  <button
                    onClick={handleCadastroClick}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
                  >
                    <span className="material-icons">rocket_launch</span>
                    Começar agora - É grátis!
                  </button>
                  <Link
                    href="#como-funciona"
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-8 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <span className="material-icons">play_circle</span>
                    Ver como funciona
                  </Link>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="aspect-square relative mx-auto w-full max-w-md">
                  <div className="absolute inset-0 rotate-6 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5"></div>
                  <div className="absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/workshop-hero.jpg"
                      alt="Oficina mecânica"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-[#F7F7F7] px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Por que escolher a ComparAuto?
              </h2>
              <p className="mx-auto max-w-2xl text-gray-600">
                Tudo o que sua oficina precisa para crescer, em uma única plataforma.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <span className="material-icons text-2xl text-primary">{feature.icon}</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="como-funciona" className="bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">Como funciona?</h2>
              <p className="text-gray-600">
                Em apenas 4 passos simples você já começa a receber novos clientes.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-4">
              {STEPS.map((step, index) => (
                <div key={index} className="relative text-center">
                  {index < STEPS.length - 1 && (
                    <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gray-200 md:block"></div>
                  )}
                  <div className="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                    <span className="material-icons text-2xl">{step.icon}</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-[#F7F7F7] px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Quem já está com a gente recomenda!
              </h2>
              <p className="text-gray-600">Veja o que nossos parceiros estão dizendo.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {TESTIMONIALS.map((testimonial, index) => (
                <div key={index} className="rounded-2xl border border-gray-100 bg-white p-8">
                  <div className="mb-4 flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="material-icons text-lg text-yellow-400">
                        star
                      </span>
                    ))}
                  </div>
                  <p className="mb-6 italic text-gray-700">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="material-icons text-primary">person</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-primary px-6 py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
            <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-white"></div>
          </div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Pronto para crescer com a ComparAuto?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
              Junte-se a centenas de oficinas que já aumentaram seu faturamento com a nossa
              plataforma.
            </p>
            <button
              onClick={handleCadastroClick}
              className="mx-auto flex items-center gap-2 rounded-xl bg-white px-10 py-4 font-semibold text-primary shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span className="material-icons">add_business</span>
              Cadastrar minha oficina agora
            </button>
            <p className="mt-4 text-sm text-white/60">É rápido, gratuito e sem compromisso!</p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white px-6 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Ficou com dúvidas?</h3>
            <p className="mb-6 text-gray-600">Nossa equipe está pronta para ajudar você!</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="mailto:contato@comparauto.com.br"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-[#F7F7F7] px-6 py-3 transition hover:border-primary"
              >
                <span className="material-icons text-primary">email</span>
                <span className="text-gray-700">contato@comparauto.com.br</span>
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-6 py-3 transition hover:bg-green-100"
              >
                <span className="material-icons text-green-600">chat</span>
                <span className="text-green-700">(11) 99999-9999</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
