'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

export default function CadastroOficina() {
  const router = useRouter()

  // Handler for CTA button
  async function handleCadastroClick(e: React.MouseEvent) {
    e.preventDefault()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      // Not logged in, redirect to login with redirect param
      router.push('/login?redirect=/cadastro-oficina/formulario')
    } else {
      // Logged in, go to form
      router.push('/cadastro-oficina/formulario')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-100 to-white px-0 py-0">
      {/* HERO SECTION */}
      <section className="flex w-full flex-col items-center bg-blue-700 px-4 py-12 text-center">
        <Image
          src="/logo.png"
          alt="ComparAuto Logo"
          width={90}
          height={90}
          className="mx-auto mb-4"
        />
        <h1 className="mb-4 text-4xl font-extrabold text-white drop-shadow-lg md:text-5xl">
          Sua oficina no topo do Brasil!
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-blue-100 md:text-2xl">
          Cadastre sua oficina na ComparAuto e conquiste novos clientes todos os dias. Visibilidade,
          confiança e crescimento para o seu negócio!
        </p>
        <button
          onClick={handleCadastroClick}
          className="rounded-full bg-yellow-400 px-8 py-3 text-lg font-bold text-blue-900 shadow-lg transition hover:bg-yellow-500"
        >
          Quero minha oficina na ComparAuto
        </button>
      </section>

      {/* BENEFÍCIOS */}
      <section className="grid w-full max-w-5xl gap-8 px-4 py-16 text-center md:grid-cols-3">
        <div className="flex flex-col items-center">
          <Image src="/globe.svg" alt="Visibilidade" width={60} height={60} className="mb-3" />
          <h2 className="mb-2 text-xl font-bold text-blue-800">Visibilidade Nacional</h2>
          <p className="text-gray-700">
            Sua oficina aparece para milhares de motoristas buscando serviços automotivos na sua
            região.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Image src="/avaliacao.png" alt="Avaliações" width={60} height={60} className="mb-3" />
          <h2 className="mb-2 text-xl font-bold text-blue-800">Avaliações Reais</h2>
          <p className="text-gray-700">
            Ganhe reputação com avaliações de clientes e destaque-se da concorrência.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Image src="/file.svg" alt="Gestão" width={60} height={60} className="mb-3" />
          <h2 className="mb-2 text-xl font-bold text-blue-800">Gestão Facilitada</h2>
          <p className="text-gray-700">
            Gerencie informações, horários e serviços da sua oficina de forma simples e rápida.
          </p>
        </div>
      </section>

      {/* DEPOIMENTO */}
      <section className="flex w-full flex-col items-center bg-blue-50 px-4 py-12">
        <h3 className="mb-6 text-2xl font-semibold text-blue-700">
          Quem já está com a gente recomenda!
        </h3>
        <div className="flex max-w-2xl flex-col items-center gap-4 rounded-xl bg-white p-6 shadow md:flex-row">
          <Image
            src="/oleo.png"
            alt="Oficina Parceira"
            width={70}
            height={70}
            className="rounded-full"
          />
          <div>
            <p className="mb-2 italic text-gray-800">
              “Depois que entrei na ComparAuto, minha oficina nunca ficou vazia. Os clientes chegam
              já confiando no nosso trabalho!”
            </p>
            <span className="font-bold text-blue-800">João Silva, Oficina do João</span>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="w-full max-w-4xl px-4 py-16">
        <h3 className="mb-8 text-center text-2xl font-bold text-blue-800">Como funciona?</h3>
        <div className="grid gap-6 text-center md:grid-cols-4">
          <div className="flex flex-col items-center">
            <Image src="/polimento.png" alt="Cadastro" width={50} height={50} />
            <span className="mt-2 font-semibold text-blue-700">1. Cadastro</span>
            <p className="text-sm text-gray-600">Preencha seus dados e informações da oficina.</p>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/higienizacao.png" alt="Aprovação" width={50} height={50} />
            <span className="mt-2 font-semibold text-blue-700">2. Aprovação</span>
            <p className="text-sm text-gray-600">
              Nosso time valida e publica sua oficina na plataforma.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/freio.png" alt="Clientes" width={50} height={50} />
            <span className="mt-2 font-semibold text-blue-700">3. Novos Clientes</span>
            <p className="text-sm text-gray-600">Receba solicitações e aumente seu faturamento.</p>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/balanceamento.png" alt="Gestão" width={50} height={50} />
            <span className="mt-2 font-semibold text-blue-700">4. Gestão Fácil</span>
            <p className="text-sm text-gray-600">
              Atualize seus dados e acompanhe avaliações em tempo real.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section id="cadastro" className="flex w-full flex-col items-center bg-yellow-400 px-4 py-12">
        <h3 className="mb-4 text-2xl font-bold text-blue-900">
          Pronto para crescer com a ComparAuto?
        </h3>
        <button
          onClick={handleCadastroClick}
          className="mb-2 rounded-full bg-blue-700 px-10 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-blue-800"
        >
          Cadastrar minha oficina agora
        </button>
        <span className="text-md text-blue-900">É rápido, gratuito e sem compromisso!</span>
      </section>

      {/* CONTATO */}
      <footer className="mt-8 w-full bg-blue-900 px-4 py-8 text-center text-blue-100">
        <h4 className="mb-2 text-lg font-semibold">Ficou com dúvidas?</h4>
        <p className="mb-1">
          Fale com nosso time:{' '}
          <a href="mailto:contato@comparauto.com.br" className="text-yellow-300 underline">
            contato@comparauto.com.br
          </a>
        </p>
        <p>
          WhatsApp:{' '}
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-300 underline"
          >
            (11) 99999-9999
          </a>
        </p>
      </footer>
    </div>
  )
}
