"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CadastroOficina() {
  const router = useRouter();

  // Handler for CTA button
  async function handleCadastroClick(e: React.MouseEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Not logged in, redirect to login with redirect param
      router.push("/login?redirect=/cadastro-oficina/formulario");
    } else {
      // Logged in, go to form
      router.push("/cadastro-oficina/formulario");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex flex-col items-center py-0 px-0">
      {/* HERO SECTION */}
      <section className="w-full bg-blue-700 py-12 px-4 flex flex-col items-center text-center">
        <Image src="/logo.png" alt="ComparAuto Logo" width={90} height={90} className="mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">Sua oficina no topo do Brasil!</h1>
        <p className="text-lg md:text-2xl text-blue-100 mb-6 max-w-2xl mx-auto">Cadastre sua oficina na ComparAuto e conquiste novos clientes todos os dias. Visibilidade, confiança e crescimento para o seu negócio!</p>
        <button onClick={handleCadastroClick} className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg text-lg transition">Quero minha oficina na ComparAuto</button>
      </section>

      {/* BENEFÍCIOS */}
      <section className="w-full max-w-5xl py-16 px-4 grid md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center">
          <Image src="/globe.svg" alt="Visibilidade" width={60} height={60} className="mb-3" />
          <h2 className="text-xl font-bold text-blue-800 mb-2">Visibilidade Nacional</h2>
          <p className="text-gray-700">Sua oficina aparece para milhares de motoristas buscando serviços automotivos na sua região.</p>
        </div>
        <div className="flex flex-col items-center">
          <Image src="/avaliacao.png" alt="Avaliações" width={60} height={60} className="mb-3" />
          <h2 className="text-xl font-bold text-blue-800 mb-2">Avaliações Reais</h2>
          <p className="text-gray-700">Ganhe reputação com avaliações de clientes e destaque-se da concorrência.</p>
        </div>
        <div className="flex flex-col items-center">
          <Image src="/file.svg" alt="Gestão" width={60} height={60} className="mb-3" />
          <h2 className="text-xl font-bold text-blue-800 mb-2">Gestão Facilitada</h2>
          <p className="text-gray-700">Gerencie informações, horários e serviços da sua oficina de forma simples e rápida.</p>
        </div>
      </section>

      {/* DEPOIMENTO */}
      <section className="w-full bg-blue-50 py-12 px-4 flex flex-col items-center">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6">Quem já está com a gente recomenda!</h3>
        <div className="max-w-2xl bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-4">
          <Image src="/oleo.png" alt="Oficina Parceira" width={70} height={70} className="rounded-full" />
          <div>
            <p className="text-gray-800 italic mb-2">“Depois que entrei na ComparAuto, minha oficina nunca ficou vazia. Os clientes chegam já confiando no nosso trabalho!”</p>
            <span className="text-blue-800 font-bold">João Silva, Oficina do João</span>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="w-full max-w-4xl py-16 px-4">
        <h3 className="text-2xl font-bold text-blue-800 text-center mb-8">Como funciona?</h3>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Image src="/polimento.png" alt="Cadastro" width={50} height={50} />
            <span className="font-semibold text-blue-700 mt-2">1. Cadastro</span>
            <p className="text-gray-600 text-sm">Preencha seus dados e informações da oficina.</p>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/higienizacao.png" alt="Aprovação" width={50} height={50} />
            <span className="font-semibold text-blue-700 mt-2">2. Aprovação</span>
            <p className="text-gray-600 text-sm">Nosso time valida e publica sua oficina na plataforma.</p>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/freio.png" alt="Clientes" width={50} height={50} />
            <span className="font-semibold text-blue-700 mt-2">3. Novos Clientes</span>
            <p className="text-gray-600 text-sm">Receba solicitações e aumente seu faturamento.</p>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/balanceamento.png" alt="Gestão" width={50} height={50} />
            <span className="font-semibold text-blue-700 mt-2">4. Gestão Fácil</span>
            <p className="text-gray-600 text-sm">Atualize seus dados e acompanhe avaliações em tempo real.</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section id="cadastro" className="w-full bg-yellow-400 py-12 px-4 flex flex-col items-center">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Pronto para crescer com a ComparAuto?</h3>
        <button onClick={handleCadastroClick} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-10 rounded-full shadow-lg text-xl transition mb-2">Cadastrar minha oficina agora</button>
        <span className="text-blue-900 text-md">É rápido, gratuito e sem compromisso!</span>
      </section>

      {/* CONTATO */}
      <footer className="w-full bg-blue-900 py-8 px-4 text-center text-blue-100 mt-8">
        <h4 className="text-lg font-semibold mb-2">Ficou com dúvidas?</h4>
        <p className="mb-1">Fale com nosso time: <a href="mailto:contato@comparauto.com.br" className="underline text-yellow-300">contato@comparauto.com.br</a></p>
        <p>WhatsApp: <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="underline text-green-300">(11) 99999-9999</a></p>
      </footer>
    </div>
  );
}