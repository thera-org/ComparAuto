'use client'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { useState, Fragment } from 'react'
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { useAppNotifications } from '@/hooks/useAppNotifications'

const TOPICOS = [
  {
    title: 'Conta e Perfil',
    icon: UserCircleIcon,
    color: 'from-blue-500 to-indigo-600',
    faqs: [
      {
        q: 'Como altero meus dados de perfil?',
        a: "Para alterar seus dados de perfil, acesse a aba 'Conta' no menu principal, clique em 'Editar Perfil', faça as alterações desejadas e clique em 'Salvar'. Você pode atualizar seu nome, foto, telefone e outras informações pessoais.",
        tags: ['perfil', 'dados', 'editar'],
      },
      {
        q: 'Como redefinir minha senha?',
        a: "Para redefinir sua senha, vá em 'Conta > Segurança' e clique em 'Alterar senha'. Digite sua senha atual, depois a nova senha duas vezes para confirmação. Recomendamos usar uma senha forte com letras, números e caracteres especiais.",
        tags: ['senha', 'segurança', 'login'],
      },
      {
        q: 'Como adicionar uma foto de perfil?',
        a: "Na página 'Conta', clique no ícone da câmera sobre sua foto atual (ou placeholder). Selecione uma imagem do seu dispositivo (JPG ou PNG, máx 5MB). A foto será atualizada automaticamente.",
        tags: ['foto', 'avatar', 'imagem'],
      },
      {
        q: 'Posso ter múltiplas contas?',
        a: 'Sim, você pode ter múltiplas contas usando e-mails diferentes. No entanto, recomendamos usar uma única conta para melhor gerenciamento de orçamentos e histórico.',
        tags: ['conta', 'múltiplas', 'email'],
      },
    ],
  },
  {
    title: 'Oficinas e Serviços',
    icon: WrenchScrewdriverIcon,
    color: 'from-purple-500 to-pink-600',
    faqs: [
      {
        q: 'Como faço para solicitar orçamentos?',
        a: 'Na página inicial, digite o serviço desejado ou selecione da lista de serviços. Adicione detalhes sobre seu veículo e a necessidade. As oficinas parceiras receberão sua solicitação e enviarão orçamentos em até 24h.',
        tags: ['orçamento', 'solicitar', 'serviço'],
      },
      {
        q: 'Como escolher a melhor oficina?',
        a: 'Compare os orçamentos recebidos considerando: preço, avaliações de outros usuários, tempo estimado, garantia oferecida e localização. Você pode ver o perfil completo de cada oficina e suas especializações.',
        tags: ['oficina', 'escolher', 'comparar'],
      },
      {
        q: 'As oficinas são verificadas?',
        a: 'Sim! Todas as oficinas parceiras passam por um processo de verificação incluindo documentação, licenças e histórico. Além disso, contamos com avaliações reais de usuários para manter a qualidade.',
        tags: ['verificação', 'confiança', 'segurança'],
      },
      {
        q: 'Posso cancelar um orçamento solicitado?',
        a: "Sim, você pode cancelar uma solicitação de orçamento a qualquer momento antes de confirmar o serviço. Acesse 'Meus Orçamentos' e clique em 'Cancelar solicitação'.",
        tags: ['cancelar', 'orçamento'],
      },
      {
        q: 'Quanto tempo leva para receber orçamentos?',
        a: 'A maioria das oficinas responde em até 24 horas. Você receberá notificações por e-mail e no aplicativo quando novos orçamentos chegarem.',
        tags: ['tempo', 'prazo', 'resposta'],
      },
    ],
  },
  {
    title: 'Pagamentos',
    icon: CreditCardIcon,
    color: 'from-green-500 to-emerald-600',
    faqs: [
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'As formas de pagamento variam por oficina e incluem: dinheiro, PIX, cartões de crédito/débito e parcelamento. Verifique as opções disponíveis no orçamento de cada oficina.',
        tags: ['pagamento', 'formas', 'métodos'],
      },
      {
        q: 'O pagamento é feito pelo aplicativo?',
        a: 'Não, o pagamento é realizado diretamente com a oficina após a conclusão do serviço. O ComparAuto é uma plataforma de comparação e conexão, não intermediamos pagamentos.',
        tags: ['pagamento', 'como pagar'],
      },
      {
        q: 'Posso parcelar o serviço?',
        a: 'Sim, muitas oficinas oferecem parcelamento. As condições (número de parcelas, taxas) variam por oficina. Consulte as opções disponíveis diretamente no orçamento.',
        tags: ['parcelamento', 'crédito'],
      },
    ],
  },
  {
    title: 'Segurança e Privacidade',
    icon: ShieldCheckIcon,
    color: 'from-orange-500 to-red-600',
    faqs: [
      {
        q: 'Meus dados estão seguros?',
        a: 'Sim! Utilizamos criptografia de ponta a ponta e seguimos as normas da LGPD. Seus dados pessoais e de veículo são protegidos e nunca são compartilhados sem sua autorização.',
        tags: ['segurança', 'dados', 'privacidade'],
      },
      {
        q: 'Como excluo minha conta?',
        a: "Para excluir sua conta permanentemente, acesse 'Conta > Configurações > Excluir Conta' ou entre em contato com suporte@comparauto.com. Todos os seus dados serão removidos em até 30 dias.",
        tags: ['exclusão', 'deletar', 'remover'],
      },
      {
        q: 'Quem tem acesso às minhas informações?',
        a: 'Apenas você e as oficinas que você escolher contatar através dos orçamentos terão acesso às suas informações. Nunca vendemos ou compartilhamos dados com terceiros.',
        tags: ['privacidade', 'acesso', 'dados'],
      },
    ],
  },
  {
    title: 'Problemas Comuns',
    icon: QuestionMarkCircleIcon,
    color: 'from-cyan-500 to-blue-600',
    faqs: [
      {
        q: 'Não recebi nenhum orçamento',
        a: 'Isso pode ocorrer se não houver oficinas especializadas na sua região. Tente ampliar o raio de busca ou entre em contato com o suporte para ajudarmos a encontrar opções.',
        tags: ['problema', 'orçamento', 'não recebeu'],
      },
      {
        q: 'Esqueci minha senha',
        a: "Na tela de login, clique em 'Esqueci minha senha'. Digite seu e-mail cadastrado e enviaremos um link para redefinição. Verifique também sua caixa de spam.",
        tags: ['senha', 'esqueci', 'recuperar'],
      },
      {
        q: 'O aplicativo está lento ou travando',
        a: 'Tente limpar o cache do navegador ou app, verificar sua conexão com internet e atualizar para a versão mais recente. Se o problema persistir, contate o suporte.',
        tags: ['problema', 'lento', 'travando'],
      },
      {
        q: 'Como reporto um problema com uma oficina?',
        a: 'Você pode avaliar a oficina após o serviço ou reportar problemas graves através do formulário de contato abaixo. Levamos todas as reclamações a sério e investigamos cada caso.',
        tags: ['reportar', 'problema', 'oficina'],
      },
    ],
  },
]

const CANAIS_ATENDIMENTO = [
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Chat Online',
    description: 'Seg-Sex, 9h às 18h',
    link: '#contato',
    color: 'text-blue-600',
  },
  {
    icon: PhoneIcon,
    title: '0800 123 4567',
    description: 'Ligação gratuita',
    link: 'tel:08001234567',
    color: 'text-green-600',
  },
  {
    icon: EnvelopeIcon,
    title: 'E-mail',
    description: 'suporte@comparauto.com',
    link: 'mailto:suporte@comparauto.com',
    color: 'text-purple-600',
  },
]

export default function AjudaPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<{ q: string; a: string } | null>(null)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    mensagem: '',
    assunto: 'geral',
    file: null as File | null,
  })
  const [enviado, setEnviado] = useState(false)
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([0]))
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const { success } = useAppNotifications()

  const openModal = (faq: { q: string; a: string }) => {
    setSelectedFAQ(faq)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedFAQ(null)
  }

  const toggleTopic = (index: number) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedTopics(newExpanded)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm({ ...form, file: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(true)
    // Simula envio
    setTimeout(() => {
      setForm({ nome: '', email: '', mensagem: '', assunto: 'geral', file: null })
      setEnviado(false)
      success('Mensagem enviada!', 'Sua mensagem foi enviada com sucesso. Retornaremos em breve.')
    }, 1500)
  }

  // Filtrar FAQs baseado na busca e categoria
  const filteredTopics = TOPICOS.map(topico => ({
    ...topico,
    faqs: topico.faqs.filter(faq => {
      const matchesSearch =
        search === '' ||
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))

      const matchesCategory = activeCategory === 'all' || topico.title === activeCategory

      return matchesSearch && matchesCategory
    }),
  })).filter(topico => topico.faqs.length > 0)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-3">
              <QuestionMarkCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-4 text-5xl font-bold text-gray-900">Central de Ajuda</h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Encontre respostas rápidas para suas dúvidas ou entre em contato com nossa equipe de
              suporte
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-10">
            <div className="relative mx-auto max-w-3xl">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Digite sua dúvida ou palavra-chave..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white px-12 py-4 text-lg shadow-lg transition focus:border-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <SparklesIcon className="mx-auto mb-2 h-8 w-8 text-blue-500" />
              <div className="text-3xl font-bold text-gray-900">
                {TOPICOS.reduce((acc, t) => acc + t.faqs.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Artigos de Ajuda</div>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <ClockIcon className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <div className="text-3xl font-bold text-gray-900">&lt; 24h</div>
              <div className="text-sm text-gray-600">Tempo de Resposta</div>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <CheckCircleIcon className="mx-auto mb-2 h-8 w-8 text-purple-500" />
              <div className="text-3xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Satisfação</div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-6 py-2 font-medium transition ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            {TOPICOS.map((topico, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(topico.title)}
                className={`rounded-full px-6 py-2 font-medium transition ${
                  activeCategory === topico.title
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {topico.title}
              </button>
            ))}
          </div>

          {/* FAQ Topics with Accordion */}
          <div className="mb-12 space-y-6">
            {filteredTopics.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-md">
                <DocumentTextIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="text-xl text-gray-500">
                  Nenhum resultado encontrado para &quot;{search}&quot;
                </p>
                <p className="mt-2 text-gray-400">Tente usar outras palavras-chave</p>
              </div>
            ) : (
              filteredTopics.map((topico, idx) => {
                const Icon = topico.icon
                const isExpanded = expandedTopics.has(idx)

                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:shadow-xl"
                  >
                    <button
                      onClick={() => toggleTopic(idx)}
                      className="flex w-full items-center justify-between p-6 text-left transition hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-xl bg-gradient-to-br ${topico.color} p-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{topico.title}</h2>
                          <p className="text-sm text-gray-500">{topico.faqs.length} perguntas</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-6 w-6 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-6">
                        <ul className="space-y-3">
                          {topico.faqs.map((faq, fIdx) => (
                            <li key={fIdx}>
                              <button
                                onClick={() => openModal(faq)}
                                className="group flex w-full items-start gap-3 rounded-lg bg-white p-4 text-left transition hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md"
                              >
                                <QuestionMarkCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C3AED] transition group-hover:scale-110" />
                                <span className="font-medium text-gray-700 group-hover:text-[#4F46E5]">
                                  {faq.q}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Contact Channels */}
          <div className="mb-12">
            <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
              Outros Canais de Atendimento
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {CANAIS_ATENDIMENTO.map((canal, idx) => {
                const Icon = canal.icon
                return (
                  <a
                    key={idx}
                    href={canal.link}
                    className="group rounded-2xl bg-white p-8 text-center shadow-lg transition hover:scale-105 hover:shadow-xl"
                  >
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gray-100 p-4 transition group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-purple-100">
                      <Icon className={`h-8 w-8 ${canal.color} transition`} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{canal.title}</h3>
                    <p className="text-gray-600">{canal.description}</p>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl bg-white p-8 shadow-xl" id="contato">
            <div className="mb-6 text-center">
              <EnvelopeIcon className="mx-auto mb-3 h-12 w-12 text-[#7C3AED]" />
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Envie uma Mensagem</h2>
              <p className="text-gray-600">Responderemos o mais rápido possível</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-gray-700">Nome Completo</label>
                  <input
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition focus:border-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/20"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block font-semibold text-gray-700">E-mail</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition focus:border-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-700">Assunto</label>
                <select
                  name="assunto"
                  value={form.assunto}
                  onChange={handleChange}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition focus:border-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/20"
                >
                  <option value="geral">Dúvida Geral</option>
                  <option value="conta">Problema com Conta</option>
                  <option value="oficina">Questão sobre Oficina</option>
                  <option value="pagamento">Pagamento</option>
                  <option value="tecnico">Problema Técnico</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-700">Mensagem</label>
                <textarea
                  name="mensagem"
                  value={form.mensagem}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Descreva sua dúvida ou problema..."
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition focus:border-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-700">Anexo (opcional)</label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="file-upload"
                    className="inline-flex cursor-pointer items-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-3 font-medium text-gray-700 transition hover:border-[#7C3AED] hover:bg-[#7C3AED]/5"
                  >
                    <DocumentTextIcon className="mr-2 h-5 w-5 text-[#7C3AED]" />
                    Selecionar arquivo
                  </label>
                  <input id="file-upload" type="file" onChange={handleFile} className="hidden" />
                  {form.file && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="max-w-xs truncate text-sm font-medium text-green-700">
                        {form.file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, file: null })}
                        className="ml-2 text-red-500 hover:text-red-700"
                        title="Remover arquivo"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Formatos aceitos: PDF, JPG, PNG. Tamanho máximo: 5MB
                </p>
              </div>

              <button
                type="submit"
                disabled={enviado}
                className="w-full rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
              >
                {enviado ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar Mensagem'
                )}
              </button>
            </form>
          </div>

          {/* Modal para FAQ - Melhorado */}
          <Transition show={modalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
              </TransitionChild>

              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
                    <div className="mb-4 flex items-start gap-4">
                      <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-3">
                        <QuestionMarkCircleIcon className="h-8 w-8 text-[#7C3AED]" />
                      </div>
                      <div className="flex-1">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                          {selectedFAQ?.q}
                        </DialogTitle>
                      </div>
                      <button
                        onClick={closeModal}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        title="Fechar"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6">
                      <p className="text-lg leading-relaxed text-gray-700">{selectedFAQ?.a}</p>
                    </div>

                    <div className="flex items-center justify-between border-t pt-6">
                      <div className="text-sm text-gray-500">Esta resposta foi útil?</div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            success('Obrigado!', 'Ficamos felizes em ajudar!')
                            closeModal()
                          }}
                          className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-200"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                          Sim
                        </button>
                        <button
                          onClick={closeModal}
                          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                        >
                          Não
                        </button>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </Dialog>
          </Transition>
        </div>
      </div>
      <Footer />
    </div>
  )
}
