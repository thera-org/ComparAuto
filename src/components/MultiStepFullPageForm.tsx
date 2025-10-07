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
  cidade: '',
  estado: '',
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
      return (
        !!form.cep && !!form.rua && !!form.numero && !!form.bairro && !!form.cidade && !!form.estado
      )
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
        data: { user },
      } = await supabase.auth.getUser()
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
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              estado: data.uf || '',
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
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserData({
          nome: data.user.user_metadata?.full_name || data.user.email || 'Usuário',
          email: data.user.email || '',
          avatar_url: data.user.user_metadata?.avatar_url || '/placeholder.svg',
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
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <label className="text-lg font-medium">Nome da oficina *</label>
            <input
              name="nome_oficina"
              value={form.nome_oficina}
              onChange={handleChange}
              className={`rounded-lg border px-4 py-3 ${
                touched.nome_oficina && !form.nome_oficina ? 'border-red-500' : 'border-gray-300'
              } bg-white text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Digite o nome da oficina"
              required
            />
            {touched.nome_oficina && !form.nome_oficina && (
              <span className="text-sm text-red-500">Campo obrigatório</span>
            )}
            <label className="font-medium">CNPJ ou CPF</label>
            <input
              name="cnpj_cpf"
              value={form.cnpj_cpf}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />
            <label className="font-medium">Razão social</label>
            <input
              name="razao_social"
              value={form.razao_social}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />
            <label className="font-medium">Descrição da oficina</label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-4 py-3"
              rows={3}
            />
          </div>
        )
      case 1:
        return (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <label>CEP *</label>
            <input
              name="cep"
              value={form.cep}
              onChange={handleChange}
              className={`rounded-lg border px-4 py-3 ${
                touched.cep && !form.cep ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <label>Rua *</label>
            <input
              name="rua"
              value={form.rua}
              onChange={handleChange}
              className={`rounded-lg border px-4 py-3 ${
                touched.rua && !form.rua ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <label>Número *</label>
            <input
              name="numero"
              value={form.numero}
              onChange={handleChange}
              className={`rounded-lg border px-4 py-3 ${
                touched.numero && !form.numero ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <label>Complemento</label>
            <input
              name="complemento"
              value={form.complemento}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />
            <label>Bairro *</label>
            <input
              name="bairro"
              value={form.bairro}
              onChange={handleChange}
              className={`rounded-lg border px-4 py-3 ${
                touched.bairro && !form.bairro ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <label>Cidade *</label>
            <input
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              className={`rounded-lg border px-4 py-3 ${
                touched.cidade && !form.cidade ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <label>Estado *</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className={`rounded-lg border px-4 py-3 ${
                touched.estado && !form.estado ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Selecione</option>
              {estados.map(uf => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        )
      case 2:
        return (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <label>Telefone fixo</label>
            <input
              name="telefone_fixo"
              value={form.telefone_fixo}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />
            <label>WhatsApp comercial *</label>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              className={`rounded-lg border px-4 py-3 ${
                touched.whatsapp && !form.whatsapp ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <label>E-mail *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`rounded-lg border px-4 py-3 ${
                touched.email && !form.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <label>Site ou redes sociais</label>
            <input
              name="site"
              value={form.site}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />
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
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-100 to-white">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-2 py-8">
        <form
          className="flex w-full flex-col items-center justify-center"
          onSubmit={e => e.preventDefault()}
        >
          {renderStep()}
        </form>
      </main>{' '}
      {/* Indicador de passos na base - hide for confirmation step */}
      {step !== 9 && (
        <footer className="flex w-full flex-col gap-4 bg-white/80 py-6 shadow-inner">
          <div className="flex justify-center gap-2 md:gap-4">
            {steps.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-lg font-bold transition-all duration-200 ${
                    i === step
                      ? 'border-blue-700 bg-blue-100 text-blue-900 shadow-lg'
                      : 'border-gray-300 bg-gray-100 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    i === step ? 'font-semibold text-blue-800' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-4 flex w-full max-w-2xl items-center justify-between px-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="rounded-full bg-gray-100 px-6 py-3 font-semibold text-blue-800 shadow transition hover:bg-gray-200"
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
              className={`rounded-full px-8 py-3 font-bold text-white shadow transition ${
                validateStep(step, form, userData)
                  ? 'bg-blue-700 hover:bg-blue-800'
                  : 'cursor-not-allowed bg-blue-200'
              }`}
            >
              Avançar
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
