'use client'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState, ChangeEvent, useEffect, useRef, useCallback } from 'react'

import { uploadMultipleImages } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

import type { LocationPickerResult } from '@/components/maps/LocationPicker'

const LocationPicker = dynamic(() => import('@/components/maps/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
        <p className="text-sm text-gray-500">Carregando mapa...</p>
      </div>
    </div>
  ),
})

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
  latitude: number | null
  longitude: number | null
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
  latitude: null,
  longitude: null,
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
        latitude: form.latitude,
        longitude: form.longitude,
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

  // Handler para seleção de localização no mapa
  // Sempre atualiza os campos com os dados do geocoding reverso,
  // permitindo que o usuário clique em múltiplos locais e o endereço acompanhe.
  const handleLocationSelect = useCallback((result: LocationPickerResult) => {
    setForm(f => ({
      ...f,
      latitude: result.lat,
      longitude: result.lng,
      // Sempre sobrescreve com os dados do geocoding quando disponíveis
      ...(result.road ? { rua: result.road } : {}),
      ...(result.number ? { numero: result.number } : { numero: '' }),
      ...(result.suburb ? { bairro: result.suburb } : {}),
      ...(result.city ? { cidade: result.city } : {}),
      ...(result.state ? { estado: result.state } : {}),
      ...(result.postcode ? { cep: result.postcode.replace(/\D/g, '') } : {}),
    }))
  }, [])

  // Estados não usado - cidade fixa em São Luís, MA
  // const estados = [
  //   'AC',
  //   'AL',
  //   'AP',
  //   'AM',
  //   'BA',
  //   'CE',
  //   'DF',
  //   'ES',
  //   'GO',
  //   'MA',
  //   'MT',
  //   'MS',
  //   'MG',
  //   'PA',
  //   'PB',
  //   'PR',
  //   'PE',
  //   'PI',
  //   'RJ',
  //   'RN',
  //   'RS',
  //   'RO',
  //   'RR',
  //   'SC',
  //   'SP',
  //   'SE',
  //   'TO',
  // ]

  // Campos de cada passo
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="mx-auto flex w-full max-w-xl flex-col px-4">
            {/* Card principal */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              {/* Header do card */}
              <div className="border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent px-6 py-6 md:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <span className="material-icons text-xl text-primary">store</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Informações da Oficina</h2>
                    <p className="text-sm text-gray-500">
                      Preencha os dados básicos da sua oficina
                    </p>
                  </div>
                </div>
              </div>

              {/* Corpo do formulário */}
              <div className="space-y-5 p-6 md:p-8">
                {/* Nome da Oficina */}
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <span className="material-icons-outlined text-lg text-gray-400">badge</span>
                  </div>
                  <input
                    name="nome_oficina"
                    value={form.nome_oficina}
                    onChange={handleChange}
                    className="peer w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Nome da Oficina *"
                    required
                  />
                </div>

                {/* CNPJ/CPF */}
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <span className="material-icons-outlined text-lg text-gray-400">
                      description
                    </span>
                  </div>
                  <input
                    name="cnpj_cpf"
                    value={form.cnpj_cpf}
                    onChange={handleChange}
                    className="peer w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="CNPJ ou CPF"
                  />
                </div>

                {/* Razão Social */}
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <span className="material-icons-outlined text-lg text-gray-400">business</span>
                  </div>
                  <input
                    name="razao_social"
                    value={form.razao_social}
                    onChange={handleChange}
                    className="peer w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Razão Social"
                  />
                </div>

                {/* Descrição */}
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-3.5">
                    <span className="material-icons-outlined text-lg text-gray-400">edit_note</span>
                  </div>
                  <textarea
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Descreva sua oficina, especialidades, diferenciais..."
                  />
                </div>
              </div>

              {/* Dica no rodapé do card */}
              <div className="border-t border-gray-100 bg-amber-50/60 px-6 py-4 md:px-8">
                <div className="flex items-start gap-3">
                  <span className="material-icons-outlined mt-0.5 text-lg text-amber-600">
                    lightbulb
                  </span>
                  <p className="text-xs leading-relaxed text-amber-700">
                    <strong>Dica:</strong> Uma boa descrição ajuda os clientes a conhecerem melhor
                    sua oficina e aumenta suas chances de agendamento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="fixed inset-0 z-50 flex">
            {/* Mapa interativo de fundo */}
            <div className="absolute inset-0">
              <LocationPicker
                initialPosition={
                  form.latitude && form.longitude
                    ? { lat: form.latitude, lng: form.longitude }
                    : null
                }
                onLocationSelect={handleLocationSelect}
                height="100%"
                zoom={15}
                showSearch={true}
                showGeolocation={true}
                searchPlaceholder="Buscar endereço da oficina..."
              />
            </div>

            {/* Painel do Formulário */}
            <div className="pointer-events-none absolute left-0 top-0 z-[5] flex h-full w-full flex-col justify-center p-4 md:w-[480px] md:p-6">
              <div className="pointer-events-auto max-h-[calc(100vh-120px)] w-full overflow-hidden overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">
                      Onde fica sua oficina?
                    </h1>
                    <p className="text-sm text-gray-500">
                      Clique no mapa ou busque o endereço para marcar a localização. Você também
                      pode arrastar o marcador para ajustar.
                    </p>
                  </div>

                  {/* Indicador de localização selecionada */}
                  {form.latitude && form.longitude && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <span className="material-icons text-lg text-green-600">check_circle</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-800">
                          Localização marcada no mapa
                        </p>
                        <p className="text-[10px] text-green-600">
                          {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  )}

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

                  {/* Botões de Navegação */}
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                      <span className="material-icons text-base">arrow_back</span>
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!validateStep(step, form, userData)}
                      className={`flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all ${
                        validateStep(step, form, userData)
                          ? 'bg-primary shadow-primary/25 hover:bg-primary-hover'
                          : 'cursor-not-allowed bg-gray-300 shadow-none'
                      }`}
                    >
                      Continuar
                      <span className="material-icons text-base">arrow_forward</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-gray-200 bg-amber-50/60 p-4">
                  <span className="material-icons-outlined mt-0.5 text-lg text-amber-600">
                    lightbulb
                  </span>
                  <p className="text-xs leading-relaxed text-amber-700">
                    <strong>Dica:</strong> Oficinas com localização precisa no mapa recebem 30% mais
                    agendamentos. Clique no mapa para marcar!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="mx-auto flex w-full max-w-xl flex-col px-4">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              {/* Header */}
              <div className="border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent px-6 py-6 md:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <span className="material-icons text-xl text-primary">contact_phone</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Informações de Contato</h2>
                    <p className="text-sm text-gray-500">Como os clientes podem falar com você?</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6 md:p-8">
                {/* Telefone Fixo */}
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <span className="material-icons-outlined text-lg text-gray-400">phone</span>
                  </div>
                  <input
                    name="telefone_fixo"
                    value={form.telefone_fixo}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Telefone Fixo"
                    type="tel"
                  />
                </div>

                {/* WhatsApp */}
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <span className="material-icons text-lg text-green-500">chat</span>
                  </div>
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="WhatsApp Comercial *"
                    type="tel"
                    required
                  />
                </div>

                {/* E-mail */}
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <span className="material-icons-outlined text-lg text-gray-400">email</span>
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="E-mail *"
                    required
                  />
                </div>

                {/* Site */}
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <span className="material-icons-outlined text-lg text-gray-400">language</span>
                  </div>
                  <input
                    name="site"
                    value={form.site}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Site ou Redes Sociais"
                    type="url"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 bg-amber-50/60 px-6 py-4 md:px-8">
                <div className="flex items-start gap-3">
                  <span className="material-icons-outlined mt-0.5 text-lg text-amber-600">
                    lightbulb
                  </span>
                  <p className="text-xs leading-relaxed text-amber-700">
                    <strong>Dica:</strong> Oficinas que respondem rápido no WhatsApp têm 2x mais
                    agendamentos confirmados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <span className="material-icons text-xl text-primary">build</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Serviços Oferecidos</h2>
                <p className="text-sm text-gray-500">Escolha os serviços e informe o valor médio</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {servicosList.map(servico => {
                const checked = form.servicosSelecionados.some(s => s.nome === servico.nome)
                const servicoData = form.servicosSelecionados.find(s => s.nome === servico.nome)

                return (
                  <div
                    key={servico.nome}
                    className={`flex flex-col gap-3 rounded-xl border-2 bg-white p-4 shadow-sm transition-all duration-200 ${
                      checked
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-gray-200 hover:border-primary/30 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleServicoCheck(servico.nome)}
                        className="h-5 w-5 accent-primary"
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
                          className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 font-semibold text-green-700 focus:border-primary focus:outline-none"
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
          <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <span className="material-icons text-xl text-primary">schedule</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Horário de Funcionamento</h2>
                <p className="text-sm text-gray-500">Quando sua oficina está aberta?</p>
              </div>
            </div>
            <label className="font-medium text-gray-700">Dias de atendimento *</label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map(dia => (
                <label
                  key={dia}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${form.diasSelecionados.includes(dia) ? 'border-primary bg-primary/5 font-medium text-primary' : 'border-gray-300 bg-white text-gray-700 hover:border-primary/30'}`}
                >
                  <input
                    type="checkbox"
                    checked={form.diasSelecionados.includes(dia)}
                    onChange={() => handleDiaCheck(dia)}
                    className="accent-primary"
                  />
                  {dia}
                </label>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Abertura *</label>
                <input
                  name="horario_abertura"
                  type="time"
                  value={form.horario_abertura}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Fechamento *
                </label>
                <input
                  name="horario_fechamento"
                  type="time"
                  value={form.horario_fechamento}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <span className="material-icons text-xl text-primary">payments</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Formas de Pagamento</h2>
                <p className="text-sm text-gray-500">Quais formas de pagamento você aceita?</p>
              </div>
            </div>
            <label className="font-medium text-gray-700">Selecione as formas aceitas *</label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {pagamentosList.map(pag => (
                <label
                  key={pag.nome}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
                    form.pagamentosSelecionados.includes(pag.nome)
                      ? 'border-primary/50 bg-primary/5 shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary/30 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.pagamentosSelecionados.includes(pag.nome)}
                    onChange={() => handlePagamentoCheck(pag.nome)}
                    className="h-5 w-5 accent-primary"
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
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <span className="material-icons text-xl text-primary">photo_library</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Imagens da Oficina</h2>
                <p className="text-sm text-gray-500">Mostre seu espaço para os clientes</p>
              </div>
            </div>
            <div>
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
                      : 'border-gray-300 bg-gray-50 hover:border-primary/40 hover:bg-gray-100'
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
          <div className="mx-auto flex w-full max-w-xl flex-col px-4">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent px-6 py-6 md:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <span className="material-icons text-xl text-primary">person</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Conta Vinculada</h2>
                    <p className="text-sm text-gray-500">A oficina será vinculada à sua conta</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 p-8">
                {userData && (
                  <>
                    <div className="relative">
                      <Image
                        src={userData.avatar_url}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="rounded-full ring-4 ring-primary/10"
                      />
                      <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white ring-2 ring-white">
                        <span className="material-icons text-sm">check</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{userData.nome}</div>
                      <div className="text-sm text-gray-500">{userData.email}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                      <span className="material-icons text-base">verified</span>
                      Conta verificada
                    </div>
                  </>
                )}
              </div>
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
                  className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover"
                >
                  Ir para Minha Conta
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
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

  // Calcular progresso
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F7F7F7]">
      {/* Header fixo */}
      {step !== 1 && (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 transition hover:opacity-80"
            >
              <span className="material-icons text-2xl text-primary">build_circle</span>
              <span className="text-lg font-bold text-gray-900">ComparAuto</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-500 sm:block">Cadastro de Oficina</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Passo {step + 1} de {steps.length}
              </span>
            </div>
          </div>
          {/* Barra de progresso */}
          <div className="h-1 w-full bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>
      )}
      <main className="flex w-full flex-1 flex-col items-center justify-center px-2 py-8 md:py-12">
        <form
          className="flex w-full flex-col items-center justify-center"
          onSubmit={e => e.preventDefault()}
        >
          {renderStep()}
        </form>
      </main>
      {/* Footer de navegação - hide for confirmation step and map step */}
      {step !== 9 && step !== 1 && (
        <footer className="sticky bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4 md:px-6">
            {step > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
              >
                <span className="material-icons text-base">arrow_back</span>
                Voltar
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(step, form, userData)}
              className={`flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all ${
                validateStep(step, form, userData)
                  ? 'bg-primary shadow-primary/25 hover:bg-primary-hover hover:shadow-xl'
                  : 'cursor-not-allowed bg-gray-300 shadow-none'
              }`}
            >
              Continuar
              <span className="material-icons text-base">arrow_forward</span>
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
        className={`rounded-xl px-8 py-3 font-bold text-white shadow-lg transition ${scrolled ? 'bg-primary shadow-primary/25 hover:bg-primary-hover' : 'cursor-not-allowed bg-gray-300 shadow-none'}`}
      >
        {submitting ? 'Enviando...' : 'Avançar'}
      </button>
    </div>
  )
}
