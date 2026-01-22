'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'

const FEATURES = [
  {
    icon: 'visibility',
    title: 'Visibilidade Nacional',
    description: 'Sua oficina aparece para milhares de motoristas buscando serviços automotivos na sua região.',
  },
  {
    icon: 'star',
    title: 'Avaliações Reais',
    description: 'Ganhe reputação com avaliações de clientes e destaque-se da concorrência.',
  },
  {
    icon: 'dashboard',
    title: 'Gestão Facilitada',
    description: 'Gerencie informações, horários e serviços da sua oficina de forma simples e rápida.',
  },
  {
    icon: 'payments',
    title: 'Aumente seu Faturamento',
    description: 'Receba novos clientes todos os dias e veja seu negócio crescer.',
  },
]

const STEPS = [
  { icon: 'edit_note', title: 'Cadastro', description: 'Preencha seus dados e informações da oficina.' },
  { icon: 'verified', title: 'Aprovação', description: 'Nosso time valida e publica sua oficina na plataforma.' },
  { icon: 'people', title: 'Novos Clientes', description: 'Receba solicitações e aumente seu faturamento.' },
  { icon: 'insights', title: 'Gestão Fácil', description: 'Atualize seus dados e acompanhe avaliações em tempo real.' },
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
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
        <section className="relative pt-20 pb-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                  <span className="material-icons text-sm">trending_up</span>
                  Mais de 500 oficinas já confiam na ComparAuto
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Sua oficina no <span className="text-primary">topo do Brasil!</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-xl">
                  Cadastre sua oficina na ComparAuto e conquiste novos clientes todos os dias. 
                  Visibilidade, confiança e crescimento para o seu negócio!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button
                    onClick={handleCadastroClick}
                    className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2"
                  >
                    <span className="material-icons">rocket_launch</span>
                    Começar agora - É grátis!
                  </button>
                  <Link
                    href="#como-funciona"
                    className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <span className="material-icons">play_circle</span>
                    Ver como funciona
                  </Link>
                </div>
              </div>
              <div className="hidden md:block relative">
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl rotate-6"></div>
                  <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/workshop-hero.jpg"
                      alt="Oficina mecânica"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 bg-[#F7F7F7]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher a ComparAuto?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Tudo o que sua oficina precisa para crescer, em uma única plataforma.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <span className="material-icons text-primary text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="como-funciona" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Como funciona?</h2>
              <p className="text-gray-600">Em apenas 4 passos simples você já começa a receber novos clientes.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {STEPS.map((step, index) => (
                <div key={index} className="text-center relative">
                  {index < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200"></div>
                  )}
                  <div className="relative z-10 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                    <span className="material-icons text-2xl">{step.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{index + 1}. {step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 bg-[#F7F7F7]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quem já está com a gente recomenda!</h2>
              <p className="text-gray-600">Veja o que nossos parceiros estão dizendo.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="material-icons text-yellow-400 text-lg">star</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
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
        <section className="py-20 px-6 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para crescer com a ComparAuto?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de oficinas que já aumentaram seu faturamento com a nossa plataforma.
            </p>
            <button
              onClick={handleCadastroClick}
              className="px-10 py-4 bg-white text-primary font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <span className="material-icons">add_business</span>
              Cadastrar minha oficina agora
            </button>
            <p className="text-white/60 text-sm mt-4">É rápido, gratuito e sem compromisso!</p>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ficou com dúvidas?</h3>
            <p className="text-gray-600 mb-6">Nossa equipe está pronta para ajudar você!</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="mailto:contato@comparauto.com.br"
                className="flex items-center gap-2 px-6 py-3 bg-[#F7F7F7] border border-gray-200 rounded-xl hover:border-primary transition"
              >
                <span className="material-icons text-primary">email</span>
                <span className="text-gray-700">contato@comparauto.com.br</span>
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition"
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
