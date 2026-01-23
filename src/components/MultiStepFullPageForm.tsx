'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState, ChangeEvent, useEffect, useRef } from 'react'

import { uploadMultipleImages } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

interface FormType {
  // Passo 0: Oficina
  nome_oficina: string
  cnpj_cpf: string
  razao_social: string
  descricao: string
  // Passo 1: Endereço
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  // Passo 2: Contato
  telefone_fixo: string
  whatsapp: string
  email: string
  site: string
  // Passo 3: Serviços
  servicos: string
  servico_outros: string
  // Passo 4: Horário
  dias_semana: string
  horario_abertura: string
  horario_fechamento: string
  // Passo 5: Pagamento
  pagamento: string
  pagamento_outros: string
  // Passo 6: Imagens
  imagens: FileList | null
  // Passo 7: Acesso
  email_login: string
  senha: string
  confirmar_senha: string
  // Passo 8: Termos
  termos: boolean
  // Novos campos
  servicosSelecionados: { nome: string; valor: string }[]
  pagamentosSelecionados: string[]
  diasSelecionados: string[]
}

const steps = [
  { label: 'Oficina' },
  { label: 'Endereço' },
  { label: 'Contato' },
  { label: 'Serviços' },
  { label: 'Horário' },
  { label: 'Pagamento' },
  { label: 'Imagens' },
  { label: 'Acesso' },
  { label: 'Termos' },
]

const initialForm: FormType = {
  nome_oficina: '',
  cnpj_cpf: '',
  razao_social: '',
  descricao: '',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: 'São Luís',
  estado: 'MA',
  telefone_fixo: '',
  whatsapp: '',
  email: '',
  site: '',
  servicos: '',
  servico_outros: '',
  dias_semana: '',
  horario_abertura: '',
  horario_fechamento: '',
  pagamento: '',
  pagamento_outros: '',
  imagens: null,
  email_login: '',
  senha: '',
  confirmar_senha: '',
  termos: false,
  servicosSelecionados: [],
  pagamentosSelecionados: [],
  diasSelecionados: [],
}

const servicosList = [
  { nome: 'Troca de óleo', icon: '/oleo.png' },
  { nome: 'Alinhamento e balanceamento', icon: '/balanceamento.png' },
  { nome: 'Elétrica', icon: '/eletrica.png' },
  { nome: 'Mecânica geral', icon: '/freio.png' },
  { nome: 'Ar-condicionado', icon: '/ar-condicionado.png' },
  { nome: 'Freios', icon: '/freio.png' },
  { nome: 'Sistema de escape', icon: '/escape.png' },
  { nome: 'Suspensão', icon: '/susp.png' },
  { nome: 'Acessórios', icon: '/acessorios.png' },
  { nome: 'Higienização', icon: '/higienizacao.png' },
  { nome: 'Película', icon: '/pelicula.png' },
  { nome: 'Bateria', icon: '/bateria.png' },
  { nome: 'Injeção eletrônica', icon: '/injecao.png' },
  { nome: 'Filtros', icon: '/filtro.png' },
  { nome: 'Polimento', icon: '/polimento.png' },
]

const pagamentosList = [
  { nome: 'Dinheiro', icon: '💵' },
  { nome: 'Cartão de crédito', icon: '💳' },
  { nome: 'Cartão de débito', icon: '💳' },
  { nome: 'Pix', icon: '📱' },
  { nome: 'Transferência', icon: '🏦' },
]

const diasSemana = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

function validateStep(
  step: number,
  form: FormType,
  userData?: { nome: string; email: string; avatar_url: string } | null
): boolean {
  switch (step) {
    case 0:
      return !!form.nome_oficina
    case 1:
      return !!form.cep && !!form.rua && !!form.numero && !!form.bairro
    case 2:
      return !!form.whatsapp && !!form.email
    case 3:
      return form.servicosSelecionados.length > 0 && form.servicosSelecionados.every(s => s.valor)
    case 4:
      return (
        form.diasSelecionados.length > 0 && !!form.horario_abertura && !!form.horario_fechamento
      )
    case 5:
      return form.pagamentosSelecionados.length > 0
    case 6:
      return !!form.imagens && form.imagens.length > 0
    case 7:
      if (userData) return true
      return !!form.email_login && !!form.senha && form.senha === form.confirmar_senha
    case 8:
      return !!form.termos
    default:
      return true
  }
}

export default function MultiStepFullPageForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormType>(initialForm)
  const [touched, setTouched] = useState<Partial<Record<keyof FormType, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)

  // Função para formatar valor em moeda
  const formatCurrency = (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')

    // Converte para número e formata
    const amount = parseFloat(numbers) / 100

    if (isNaN(amount)) return 'R$ 0,00'

    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  // Função para extrair apenas números do valor formatado
  const extractNumbers = (value: string): string => {
    return value.replace(/\D/g, '')
  }

  const handleSubmitOficina = async () => {
    try {
      setSubmitting(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) throw new Error('Usuário não autenticado')

      // Verificar se o usuário existe na tabela usuarios
      const { data: usuarioExiste, error: usuarioCheckError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', user.id)
        .maybeSingle() // Use maybeSingle() em vez de single()

      // Se não existir, criar o registro
      if (!usuarioExiste && !usuarioCheckError) {
        const { error: criarUsuarioError } = await supabase.from('usuarios').insert({
          id: user.id,
          nome: user.user_metadata?.full_name || user.email,
          email: user.email,
          tipo: 'cliente',
        })

        if (criarUsuarioError) throw criarUsuarioError
      }

      // Upload de imagens se houver
      let imagensUrls: string[] = []
      if (form.imagens && form.imagens.length > 0) {
        console.log(`Fazendo upload de ${form.imagens.length} imagens...`)
        try {
          const filesArray = Array.from(form.imagens)
          imagensUrls = await uploadMultipleImages(filesArray, 'oficinas')
          console.log(`${imagensUrls.length} imagens enviadas com sucesso`)

          if (imagensUrls.length === 0) {
            throw new Error(
              'Nenhuma imagem foi enviada com sucesso. Verifique o tamanho e formato dos arquivos.'
            )
          }
        } catch (uploadError) {
          console.error('Erro no upload das imagens:', uploadError)
          throw new Error('Erro ao fazer upload das imagens. Tente novamente.')
        }
      }

      // Inserir dados na tabela principal oficinas
      console.log('Inserindo oficina no banco de dados...')
      const oficinaInsertData = {
        nome: form.nome_oficina,
        endereco: `${form.rua}, ${form.numero}${form.complemento ? `, ${form.complemento}` : ''}, ${form.bairro}, ${form.cidade} - ${form.estado}`,
        telefone: form.telefone_fixo || form.whatsapp,
        email: form.email,
        descricao: form.descricao || null,
        status: 'pendente',
        user_id: user.id,
        cnpj_cpf: form.cnpj_cpf || null,
        razao_social: form.razao_social || null,
        rua: form.rua,
        numero: form.numero,
        complemento: form.complemento || null,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        cep: form.cep,
        telefone_fixo: form.telefone_fixo || null,
        whatsapp: form.whatsapp,
        site: form.site || null,
        horario_funcionamento: `${form.horario_abertura} - ${form.horario_fechamento}`,
        foto_url: imagensUrls.length > 0 ? imagensUrls[0] : null,
        imagens_urls: imagensUrls.length > 0 ? imagensUrls : null,
        servicos_oferecidos: form.servicosSelecionados.map(s => s.nome),
        formas_pagamento: form.pagamentosSelecionados,
        dias_funcionamento: form.diasSelecionados,
        horario_abertura: form.horario_abertura,
        horario_fechamento: form.horario_fechamento,
      }

      const { data: oficinaData, error: oficinaError } = await supabase
        .from('oficinas')
        .insert(oficinaInsertData)
        .select()
        .single()

      if (oficinaError) {
        console.error('Erro ao inserir oficina:', oficinaError)
        throw new Error(`Erro ao cadastrar oficina: ${oficinaError.message}`)
      }

      console.log('Oficina cadastrada com sucesso:', oficinaData)

      // Oficina cadastrada com sucesso!
      // Todos os dados (serviços, pagamentos, horários e imagens) já foram salvos na tabela principal
      alert('Oficina cadastrada com sucesso! Aguarde a aprovação do administrador.')

      setStep(9) // Go to confirmation step
    } catch (error) {
      console.error('Erro completo ao enviar dados da oficina:', error)

      let errorMessage = 'Erro ao enviar dados da oficina. Tente novamente.'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      alert(
        `❌ ${errorMessage}\n\nDetalhes foram registrados no console. Por favor, tente novamente.`
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    const { name, value } = target
    if (target.type === 'checkbox') {
      setForm({ ...form, [name]: (target as HTMLInputElement).checked })
    } else if (target.type === 'file') {
      setForm({ ...form, [name]: (target as HTMLInputElement).files })
    } else {
      setForm({ ...form, [name]: value })
    }
    setTouched({ ...touched, [name]: true })
  }

  const handleNext = () => {
    if (validateStep(step, form, userData)) setStep(s => s + 1)
    else setTouched(t => ({ ...t, [`step${step}`]: true }))
  }

  const handlePrev = () => setStep(s => Math.max(0, s - 1))
  // Busca endereço por CEP
  useEffect(() => {
    if (form.cep && form.cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${form.cep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setForm(f => ({
              ...f,
              rua: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || 'São Luís',
              estado: data.uf || 'MA',
            }))
          }
        })
    }
  }, [form.cep])

  // Busca usuário logado para passo de conta
  const [userData, setUserData] = useState<{
    nome: string
    email: string
    avatar_url: string
  } | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user
      if (user) {
        setUserData({
          nome: user.user_metadata?.full_name || user.email || 'Usuário',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url || '/placeholder.svg',
        })
      }
    })
  }, [])

  const handleServicoCheck = (nome: string) => {
    setForm(f => {
      const exists = f.servicosSelecionados.find(s => s.nome === nome)
      if (exists) {
        return { ...f, servicosSelecionados: f.servicosSelecionados.filter(s => s.nome !== nome) }
      } else {
        return { ...f, servicosSelecionados: [...f.servicosSelecionados, { nome, valor: '' }] }
      }
    })
  }
  const handleServicoValor = (nome: string, valor: string) => {
    // Formata o valor enquanto o usuário digita
    const formattedValue = formatCurrency(valor)
    setForm(f => ({
      ...f,
      servicosSelecionados: f.servicosSelecionados.map(s =>
        s.nome === nome ? { ...s, valor: formattedValue } : s
      ),
    }))
  }
  const handlePagamentoCheck = (nome: string) => {
    setForm(f => {
      if (f.pagamentosSelecionados.includes(nome)) {
        return { ...f, pagamentosSelecionados: f.pagamentosSelecionados.filter(p => p !== nome) }
      } else {
        return { ...f, pagamentosSelecionados: [...f.pagamentosSelecionados, nome] }
      }
    })
  }
  const handleDiaCheck = (dia: string) => {
    setForm(f => {
      if (f.diasSelecionados.includes(dia)) {
        return { ...f, diasSelecionados: f.diasSelecionados.filter(d => d !== dia) }
      } else {
        return { ...f, diasSelecionados: [...f.diasSelecionados, dia] }
      }
    })
  }

  const estados = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ]

  // Campos de cada passo
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4">
            <div className="mb-2">
              <h2 className="mb-1 text-2xl font-bold text-gray-800">Informações da Oficina</h2>
              <p className="text-sm text-gray-600">Preencha os dados básicos da sua oficina</p>
            </div>

            {/* Nome da Oficina */}
            <input
              name="nome_oficina"
              value={form.nome_oficina}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Nome da Oficina *"
              required
            />

            {/* CNPJ/CPF */}
            <input
              name="cnpj_cpf"
              value={form.cnpj_cpf}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="CNPJ ou CPF"
            />

            {/* Razão Social */}
            <input
              name="razao_social"
              value={form.razao_social}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Razão Social"
            />

            {/* Descrição */}
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={4}
              className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Descrição da Oficina"
            />

            <div className="flex items-start gap-3 rounded-2xl border border-blue-200/50 bg-blue-50/50 p-4">
              <span className="material-icons-outlined mt-0.5 text-lg text-blue-600">
                lightbulb
              </span>
              <p className="text-xs leading-relaxed text-blue-700">
                <strong>Dica:</strong> Uma boa descrição ajuda os clientes a conhecerem melhor sua
                oficina e aumenta suas chances de agendamento.
              </p>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="fixed inset-0 z-50 flex">
            {/* Mapa de Fundo */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-gray-200">
              <img
                alt="Mapa interativo da região"
                className="h-full w-full scale-110 object-cover opacity-90"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3x2zWmy5vgxFPyIki4LdbMpfjCjIaTlDcU238IzRdn_e7anmhsv_BAZfHUA2VeuDowzks0-7pJ8lOX5dI9nNzw61C8p128uFA2PwPLGzAPIht6uuceTvWA3pJVXOBUTbM9ciogg2uc6UKrv2gs11tg27l2SbozFjBgCR1wBHklJry1l3CNN3c3ALsrJWfm5TvisTV_nk1m3HekZkvaSho8Rjj1vrcRHouzJSQqQTOYqHluXPhCUc9hxlKpDxknHL_N6hWmVmtDu4"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent"></div>

              {/* Marcador Central */}
              <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center drop-shadow-2xl">
                <span className="material-icons relative top-2 pb-1 text-6xl text-primary drop-shadow-md filter">
                  location_on
                </span>
                <div className="h-2 w-4 rounded-[100%] bg-black/30 blur-[2px]"></div>
                <div className="mt-2 animate-bounce whitespace-nowrap rounded-full border border-gray-100 bg-white px-4 py-2 text-xs font-bold text-gray-800 shadow-xl">
                  Arraste o mapa para ajustar
                </div>
              </div>

              {/* Pins de preço decorativos */}
              <div className="absolute left-[40%] top-1/3 flex cursor-pointer items-center gap-1 rounded-xl bg-white p-1.5 opacity-80 shadow-md transition hover:scale-110 hover:opacity-100">
                <span className="px-1 text-[10px] font-bold text-gray-800">R$ 120</span>
              </div>
              <div className="absolute bottom-1/4 right-[20%] flex cursor-pointer items-center gap-1 rounded-xl bg-white p-1.5 opacity-80 shadow-md transition hover:scale-110 hover:opacity-100">
                <span className="px-1 text-[10px] font-bold text-gray-800">R$ 180</span>
              </div>
              <div className="absolute right-[30%] top-[20%] flex cursor-pointer items-center gap-1 rounded-xl bg-white p-1.5 opacity-80 shadow-md transition hover:scale-110 hover:opacity-100">
                <span className="px-1 text-[10px] font-bold text-gray-800">R$ 150</span>
              </div>
            </div>

            {/* Painel do Formulário */}
            <div className="pointer-events-none absolute left-0 top-0 z-30 flex h-full w-full flex-col justify-center p-4 md:w-[480px] md:p-6">
              <div className="pointer-events-auto max-h-[calc(100vh-120px)] w-full overflow-hidden overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">
                      Onde fica sua oficina?
                    </h1>
                    <p className="text-sm text-gray-500">
                      Confirme o endereço da sua oficina. Sua localização exata só será mostrada aos
                      clientes após a confirmação do agendamento.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* CEP */}
                    <div className="relative">
                      <input
                        name="cep"
                        value={form.cep}
                        onChange={handleChange}
                        className="peer peer block w-full appearance-none rounded-xl border border-gray-300 bg-transparent px-4 pb-2.5 pt-5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-0"
                        placeholder=" "
                        type="text"
                        maxLength={8}
                      />
                      <label
                        htmlFor="cep"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-1 text-sm font-medium text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
                      >
                        CEP
                      </label>
                      {form.cep && form.cep.length === 8 && (
                        <div className="absolute right-3 top-4">
                          <span className="material-icons text-lg text-green-500">
                            check_circle
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Endereço */}
                    <div className="relative">
                      <input
                        name="rua"
                        value={form.rua}
                        onChange={handleChange}
                        className="peer peer block w-full appearance-none rounded-xl border border-gray-300 bg-transparent px-4 pb-2.5 pt-5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-0"
                        placeholder=" "
                        type="text"
                      />
                      <label
                        htmlFor="rua"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-1 text-sm font-medium text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
                      >
                        Endereço
                      </label>
                    </div>

                    {/* Bairro e Número */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          name="bairro"
                          value={form.bairro}
                          onChange={handleChange}
                          className="peer peer block w-full appearance-none rounded-xl border border-gray-300 bg-transparent px-4 pb-2.5 pt-5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-0"
                          placeholder=" "
                          type="text"
                        />
                        <label
                          htmlFor="bairro"
                          className="absolute left-4 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-1 text-sm font-medium text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
                        >
                          Bairro
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          name="numero"
                          value={form.numero}
                          onChange={handleChange}
                          className="peer peer block w-full appearance-none rounded-xl border border-gray-300 bg-transparent px-4 pb-2.5 pt-5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-0"
                          placeholder=" "
                          type="text"
                        />
                        <label
                          htmlFor="numero"
                          className="absolute left-4 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-1 text-sm font-medium text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
                        >
                          Número
                        </label>
                      </div>
                    </div>

                    {/* Cidade - Disabled */}
                    <div className="relative">
                      <input
                        name="cidade"
                        value={form.cidade ? `${form.cidade}, ${form.estado}` : 'São Luís, MA'}
                        disabled
                        className="peer peer block w-full cursor-not-allowed appearance-none rounded-xl border border-gray-300 bg-gray-50 px-4 pb-2.5 pt-5 text-sm text-gray-500 focus:outline-none focus:ring-0"
                        placeholder=" "
                        type="text"
                      />
                      <label
                        htmlFor="cidade"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform bg-transparent px-1 text-sm font-medium text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75"
                      >
                        Cidade
                      </label>
                      <div className="absolute right-3 top-4">
                        <span className="material-icons text-lg text-gray-400">lock</span>
                      </div>
                    </div>

                    {/* Complemento */}
                    <div className="relative">
                      <input
                        name="complemento"
                        value={form.complemento}
                        onChange={handleChange}
                        className="peer peer block w-full appearance-none rounded-xl border border-gray-300 bg-transparent px-4 pb-2.5 pt-5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-0"
                        placeholder=" "
                        type="text"
                      />
                      <label
                        htmlFor="complemento"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-1 text-sm font-medium text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
                      >
                        Complemento (opcional)
                      </label>
                    </div>

                    {/* Campo oculto para estado */}
                    <input type="hidden" name="estado" value={form.estado || 'MA'} />
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      className="text-sm font-medium text-gray-500 transition hover:underline"
                    >
                      Não encontrei meu endereço
                    </button>
                  </div>

                  {/* Botões de Navegação */}
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!validateStep(step, form, userData)}
                      className={`rounded-full px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                        validateStep(step, form, userData)
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'cursor-not-allowed bg-gray-300'
                      }`}
                    >
                      Continuar
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-gray-200 bg-gray-50 p-4">
                  <span className="material-icons-outlined mt-0.5 text-lg text-gray-500">
                    lightbulb
                  </span>
                  <p className="text-xs leading-relaxed text-gray-500">
                    <strong>Dica:</strong> Oficinas com localização precisa recebem 30% mais
                    agendamentos.
                  </p>
                </div>
              </div>
            </div>

            {/* Controles do Mapa */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
              <button
                type="button"
                aria-label="Minha localização"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-700 shadow-lg transition hover:bg-gray-50"
              >
                <span className="material-icons text-xl">my_location</span>
              </button>
              <div className="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                <button
                  type="button"
                  aria-label="Zoom In"
                  className="flex h-10 w-10 items-center justify-center border-b border-gray-100 text-gray-700 transition hover:bg-gray-50"
                >
                  <span className="material-icons text-xl">add</span>
                </button>
                <button
                  type="button"
                  aria-label="Zoom Out"
                  className="flex h-10 w-10 items-center justify-center text-gray-700 transition hover:bg-gray-50"
                >
                  <span className="material-icons text-xl">remove</span>
                </button>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4">
            <div className="mb-2">
              <h2 className="mb-1 text-2xl font-bold text-gray-800">Informações de Contato</h2>
              <p className="text-sm text-gray-600">
                Como os clientes podem entrar em contato com sua oficina?
              </p>
            </div>

            {/* Telefone Fixo */}
            <input
              name="telefone_fixo"
              value={form.telefone_fixo}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Telefone Fixo"
              type="tel"
            />

            {/* WhatsApp */}
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="WhatsApp Comercial *"
              type="tel"
              required
            />

            {/* E-mail */}
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="E-mail *"
              required
            />

            {/* Site */}
            <input
              name="site"
              value={form.site}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Site ou Redes Sociais"
              type="url"
            />

            <div className="flex items-start gap-3 rounded-2xl border border-blue-200/50 bg-blue-50/50 p-4">
              <span className="material-icons-outlined mt-0.5 text-lg text-blue-600">
                lightbulb
              </span>
              <p className="text-xs leading-relaxed text-blue-700">
                <strong>Dica:</strong> Oficinas que respondem rápido no WhatsApp têm 2x mais
                agendamentos confirmados.
              </p>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <div>
              <label className="mb-2 block text-lg font-medium">
                Selecione os serviços oferecidos *
              </label>
              <p className="mb-4 text-sm text-gray-600">
                Escolha os serviços e informe o valor médio cobrado
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {servicosList.map(servico => {
                const checked = form.servicosSelecionados.some(s => s.nome === servico.nome)
                const servicoData = form.servicosSelecionados.find(s => s.nome === servico.nome)

                return (
                  <div
                    key={servico.nome}
                    className={`flex flex-col gap-3 rounded-xl border-2 bg-white p-4 shadow-md transition-all duration-200 ${
                      checked
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleServicoCheck(servico.nome)}
                        className="h-5 w-5 accent-blue-600"
                      />
                      <Image
                        src={servico.icon}
                        alt={servico.nome}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <span className="flex-1 font-medium text-gray-800">{servico.nome}</span>
                    </div>

                    {checked && (
                      <div className="ml-8">
                        <label className="mb-1 block text-xs text-gray-600">Valor médio</label>
                        <input
                          type="text"
                          placeholder="Digite o valor"
                          value={servicoData?.valor || ''}
                          onChange={e => handleServicoValor(servico.nome, e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 font-semibold text-green-700 focus:border-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Ex: Digite "10000" para R$ 100,00
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {form.servicosSelecionados.length > 0 && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  ✓ {form.servicosSelecionados.length}{' '}
                  {form.servicosSelecionados.length === 1
                    ? 'serviço selecionado'
                    : 'serviços selecionados'}
                </p>
              </div>
            )}
          </div>
        )
      case 4:
        return (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <label className="font-medium">Selecione os dias de atendimento *</label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map(dia => (
                <label
                  key={dia}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${form.diasSelecionados.includes(dia) ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}
                >
                  <input
                    type="checkbox"
                    checked={form.diasSelecionados.includes(dia)}
                    onChange={() => handleDiaCheck(dia)}
                    className="accent-blue-600"
                  />
                  {dia}
                </label>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Horário de abertura *</label>
                <input
                  name="horario_abertura"
                  type="time"
                  value={form.horario_abertura}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />
              </div>
              <div>
                <label className="font-medium">Horário de fechamento *</label>
                <input
                  name="horario_fechamento"
                  type="time"
                  value={form.horario_fechamento}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <label className="text-lg font-medium">Formas de pagamento aceitas *</label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {pagamentosList.map(pag => (
                <label
                  key={pag.nome}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
                    form.pagamentosSelecionados.includes(pag.nome)
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.pagamentosSelecionados.includes(pag.nome)}
                    onChange={() => handlePagamentoCheck(pag.nome)}
                    className="h-5 w-5 accent-blue-600"
                  />
                  <span className="text-2xl">{pag.icon}</span>
                  <span className="font-medium">{pag.nome}</span>
                </label>
              ))}
            </div>
          </div>
        )
      case 6:
        return (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <div>
              <label className="mb-3 block text-lg font-medium">Imagens da oficina *</label>
              <div className="relative">
                <input
                  name="imagens"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  multiple
                  onChange={handleChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label
                  htmlFor="file-upload"
                  className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
                    touched.imagens && (!form.imagens || form.imagens.length === 0)
                      ? 'border-red-500 bg-red-50 hover:bg-red-100'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg
                      className="mb-3 h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e
                      solte
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG ou WEBP (MAX. 5MB cada)</p>
                  </div>
                </label>
              </div>

              {form.imagens && form.imagens.length > 0 && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="mb-2 text-sm font-medium text-green-800">
                    ✓ {form.imagens.length}{' '}
                    {form.imagens.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
                  </p>
                  <ul className="space-y-1 text-xs text-green-700">
                    {Array.from(form.imagens).map((file, index) => (
                      <li key={index} className="truncate">
                        • {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Envie até 5 imagens de qualidade mostrando:
                </p>
                <ul className="ml-6 mt-2 space-y-1 text-xs text-blue-700">
                  <li>• Fachada da oficina</li>
                  <li>• Área de atendimento</li>
                  <li>• Equipamentos e ferramentas</li>
                  <li>• Equipe de trabalho</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 7:
        return (
          <div className="flex min-h-[40vh] w-full flex-col items-center justify-center">
            <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg">
              <span className="text-lg font-semibold text-blue-800">
                A oficina será vinculada à sua conta:
              </span>
              {userData && (
                <>
                  <Image
                    src={userData.avatar_url}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <div className="text-xl font-bold text-blue-900">{userData.nome}</div>
                  <div className="text-blue-700">{userData.email}</div>
                </>
              )}
            </div>
          </div>
        )
      case 8:
        return <TermosScrollStep onAvancar={handleSubmitOficina} submitting={submitting} />
      case 9:
        return (
          <div className="flex min-h-[60vh] w-full flex-col items-center justify-center">
            <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-xl bg-white p-8 text-center shadow-lg">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-800">Oficina Enviada!</h2>
                <p className="text-gray-600">
                  Sua oficina foi enviada para análise da nossa equipe. Você receberá um e-mail de
                  confirmação em breve.
                </p>
              </div>

              <div className="w-full rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-800">Entre em contato conosco:</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>📧 Email: suporte@comparauto.com</p>
                  <p>📱 WhatsApp: (11) 99999-9999</p>
                  <p>🕒 Horário: Segunda a Sexta, 8h às 18h</p>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => router.push('/conta')}
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Ir para Minha Conta
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  Voltar ao Início
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-2 py-8">
        <form
          className="flex w-full flex-col items-center justify-center"
          onSubmit={e => e.preventDefault()}
        >
          {renderStep()}
        </form>
      </main>
      {/* Indicador de passos na base - hide for confirmation step and map step */}
      {step !== 9 && step !== 1 && (
        <footer className="flex w-full flex-col gap-4 bg-white/90 py-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex justify-center gap-2 md:gap-4">
            {steps.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-200 ${
                    i === step
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                      : i < step
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-gray-300 bg-gray-100 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-1 hidden text-xs md:block ${
                    i === step ? 'font-semibold text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-2 flex w-full max-w-2xl items-center justify-between px-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Voltar
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(step, form, userData)}
              className={`rounded-full px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                validateStep(step, form, userData)
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'cursor-not-allowed bg-gray-300'
              }`}
            >
              Continuar
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}

// Componente TermosScrollStep
function TermosScrollStep({
  onAvancar,
  submitting,
}: {
  onAvancar: () => void
  submitting: boolean
}) {
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setScrolled(true)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])
  // Exemplo de texto longo
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div
        ref={ref}
        className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow"
        style={{ minHeight: 240 }}
      >
        <h2 className="mb-2 text-xl font-bold">Termos de Uso e Política de Privacidade</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu
          tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris
          consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec
          urna. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam
          massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus
          enim, nec dictum ex enim nec urna. Etiam euismod, urna eu tincidunt consectetur, nisi nisl
          aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum
          facilisis, sapien erat cursus enim, nec dictum ex enim nec urna.
        </p>
        <p>
          Proin nec urna euismod, tincidunt nunc eu, dictum erat. Etiam euismod, urna eu tincidunt
          consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat,
          velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna. Etiam
          euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl
          quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec
          dictum ex enim nec urna.
        </p>
        <p>
          Proin nec urna euismod, tincidunt nunc eu, dictum erat. Etiam euismod, urna eu tincidunt
          consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat,
          velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna. Etiam
          euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl
          quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec
          dictum ex enim nec urna.
        </p>
        <p>
          Proin nec urna euismod, tincidunt nunc eu, dictum erat. Etiam euismod, urna eu tincidunt
          consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat,
          velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna. Etiam
          euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl
          quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec
          dictum ex enim nec urna.
        </p>
      </div>
      <button
        type="button"
        disabled={!scrolled || submitting}
        onClick={onAvancar}
        className={`rounded-full px-8 py-3 font-bold text-white shadow transition ${scrolled ? 'bg-blue-700 hover:bg-blue-800' : 'cursor-not-allowed bg-blue-200'}`}
      >
        {submitting ? 'Enviando...' : 'Avançar'}
      </button>
    </div>
  )
}
