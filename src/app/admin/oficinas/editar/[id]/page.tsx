'use client'

import {
  MapPin,
  Phone,
  Clock,
  CreditCard,
  Building,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  X,
  ArrowLeft,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'

import AdminLayout from '@/components/admin-layout'
import AdminAuthGate from '@/components/AdminAuthGate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useNotifications } from '@/contexts/NotificationContext'
import { uploadMultipleImages } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

const Map = dynamic(() => import('@/components/WorkshopMap'), { ssr: false })

interface FormData {
  // Passo 1: Dados básicos
  nome: string
  cnpj_cpf: string
  razao_social: string
  descricao: string

  // Passo 2: Endereço
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  latitude: number | null
  longitude: number | null

  // Passo 3: Contato
  telefone: string
  whatsapp: string
  email: string
  site: string

  // Passo 4: Serviços
  servicosSelecionados: { nome: string; valor: string; icone: string }[]
  servico_outros: string

  // Passo 5: Horário
  diasSelecionados: string[]
  horario_abertura: string
  horario_fechamento: string

  // Passo 6: Pagamento
  pagamentosSelecionados: string[]
  pagamento_outros: string

  // Passo 7: Imagens
  imagens: File[]
  imagensPreview: string[]
  imagensExistentes: string[]

  // Status
  status: string
}

const servicosList = [
  { nome: 'Troca de óleo', icone: '/oleo.png' },
  { nome: 'Alinhamento e balanceamento', icone: '/balanceamento.png' },
  { nome: 'Elétrica', icone: '/eletrica.png' },
  { nome: 'Mecânica geral', icone: '/freio.png' },
  { nome: 'Ar-condicionado', icone: '/ar-condicionado.png' },
  { nome: 'Suspensão', icone: '/susp.png' },
  { nome: 'Sistema de escape', icone: '/escape.png' },
  { nome: 'Injeção eletrônica', icone: '/injecao.png' },
  { nome: 'Filtros', icone: '/filtro.png' },
  { nome: 'Bateria', icone: '/bateria.png' },
  { nome: 'Higienização', icone: '/higienizacao.png' },
  { nome: 'Polimento', icone: '/polimento.png' },
  { nome: 'Película', icone: '/pelicula.png' },
  { nome: 'Acessórios', icone: '/acessorios.png' },
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

const formasPagamento = [
  'Dinheiro',
  'Cartão de débito',
  'Cartão de crédito',
  'PIX',
  'Transferência bancária',
  'Boleto bancário',
]

const steps = [
  { title: 'Dados Básicos', icon: Building },
  { title: 'Endereço', icon: MapPin },
  { title: 'Contato', icon: Phone },
  { title: 'Serviços', icon: Check },
  { title: 'Horário', icon: Clock },
  { title: 'Pagamento', icon: CreditCard },
  { title: 'Imagens', icon: Upload },
]

export default function EditarOficinaPage() {
  const router = useRouter()
  const params = useParams()
  const oficinaId = params.id as string
  const { success, error: showError } = useNotifications()

  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    nome: '',
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
    telefone: '',
    whatsapp: '',
    email: '',
    site: '',
    servicosSelecionados: [],
    servico_outros: '',
    diasSelecionados: [],
    horario_abertura: '',
    horario_fechamento: '',
    pagamentosSelecionados: [],
    pagamento_outros: '',
    imagens: [],
    imagensPreview: [],
    imagensExistentes: [],
    status: 'ativo',
    latitude: null,
    longitude: null,
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  // Carregar dados da oficina
  useEffect(() => {
    const loadOficina = async () => {
      if (!oficinaId) return

      try {
        const { data, error } = await supabase
          .from('oficinas')
          .select('*')
          .eq('id', oficinaId)
          .single()

        if (error) throw error

        if (data) {
          // Extrair endereço componente por componente se estiver concatenado
          const enderecoParts = data.endereco?.split(', ') || []

          setFormData({
            nome: data.nome || '',
            cnpj_cpf: data.cnpj_cpf || '',
            razao_social: data.razao_social || '',
            descricao: data.descricao || '', // Usar 'descricao' que existe no banco
            email: data.email || '',
            telefone: data.telefone || data.telefone_fixo || '',
            whatsapp: data.whatsapp || '', // Campo existe no banco
            site: data.site || '', // Campo existe no banco

            // Usar campos separados se existirem, senão tentar extrair do endereço concatenado
            cep: data.cep || '',
            rua: data.rua || enderecoParts[0] || '',
            numero: data.numero || enderecoParts[1] || '',
            complemento: data.complemento || '',
            bairro: data.bairro || enderecoParts[2] || '',
            cidade: data.cidade || enderecoParts[3]?.split(' - ')[0] || '',
            estado: data.estado || enderecoParts[3]?.split(' - ')[1] || '',

            latitude: data.latitude,
            longitude: data.longitude,

            // Usar nome correto da coluna e lidar com arrays PostgreSQL
            servicosSelecionados: data.servicos_oferecidos
              ? Array.isArray(data.servicos_oferecidos)
                ? data.servicos_oferecidos.map((nome: string) => ({ nome, valor: '', icone: '' }))
                : []
              : [],
            servico_outros: '', // Não existe no banco

            diasSelecionados: Array.isArray(data.dias_funcionamento) ? data.dias_funcionamento : [],
            horario_abertura: data.horario_abertura || '',
            horario_fechamento: data.horario_fechamento || '',

            pagamentosSelecionados: Array.isArray(data.formas_pagamento)
              ? data.formas_pagamento
              : [],
            pagamento_outros: '', // Não existe no banco

            // Carregar imagens existentes
            imagensExistentes: (() => {
              const imagens: string[] = []
              if (data.foto_url) imagens.push(data.foto_url)
              if (data.imagens_urls) {
                try {
                  const imagensAdicionais = Array.isArray(data.imagens_urls)
                    ? data.imagens_urls
                    : JSON.parse(data.imagens_urls)
                  if (Array.isArray(imagensAdicionais)) {
                    // Evitar duplicatas da foto_url
                    imagensAdicionais.forEach((img: string) => {
                      if (!imagens.includes(img)) {
                        imagens.push(img)
                      }
                    })
                  }
                } catch (e) {
                  console.warn('Erro ao parsear imagens_urls:', e)
                }
              }
              return imagens
            })(),
            imagens: [],
            imagensPreview: [],

            status: data.status || 'ativo',
          })
        }
      } catch (err) {
        console.error('Erro ao carregar oficina:', err)
        setError('Erro ao carregar dados da oficina')
      } finally {
        setLoading(false)
      }
    }

    loadOficina()
  }, [oficinaId])

  const validateCurrentStep = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {}

    switch (currentStep) {
      case 0: // Dados básicos
        if (!formData.nome.trim()) {
          errors.nome = 'Nome é obrigatório'
        } else if (formData.nome.trim().length < 2) {
          errors.nome = 'Nome deve ter pelo menos 2 caracteres'
        }

        if (!formData.email.trim()) {
          errors.email = 'Email é obrigatório'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Email deve ser válido'
        }

        if (!formData.cnpj_cpf.trim()) {
          errors.cnpj_cpf = 'CNPJ/CPF é obrigatório'
        } else if (formData.cnpj_cpf.trim().length < 11) {
          errors.cnpj_cpf = 'CNPJ/CPF deve ter pelo menos 11 caracteres'
        }
        break

      case 1: // Endereço
        if (!formData.cep.trim()) {
          errors.cep = 'CEP é obrigatório'
        } else if (!/^\d{5}-?\d{3}$/.test(formData.cep.trim())) {
          errors.cep = 'CEP deve ter formato válido (00000-000)'
        }

        if (!formData.rua.trim()) {
          errors.rua = 'Rua é obrigatória'
        } else if (formData.rua.trim().length < 3) {
          errors.rua = 'Rua deve ter pelo menos 3 caracteres'
        }

        if (!formData.numero.trim()) {
          errors.numero = 'Número é obrigatório'
        }

        if (!formData.bairro.trim()) {
          errors.bairro = 'Bairro é obrigatório'
        } else if (formData.bairro.trim().length < 2) {
          errors.bairro = 'Bairro deve ter pelo menos 2 caracteres'
        }

        if (!formData.cidade.trim()) {
          errors.cidade = 'Cidade é obrigatória'
        } else if (formData.cidade.trim().length < 2) {
          errors.cidade = 'Cidade deve ter pelo menos 2 caracteres'
        }

        if (!formData.estado.trim()) {
          errors.estado = 'Estado é obrigatório'
        } else if (formData.estado.trim().length !== 2) {
          errors.estado = 'Estado deve ter 2 caracteres (ex: SP)'
        }

        if (formData.latitude === null || formData.longitude === null) {
          errors.rua = 'Selecione a localização no mapa'
        }
        break

      case 2: // Contato
        if (!formData.telefone.trim()) {
          errors.telefone = 'Telefone é obrigatório'
        } else if (
          !/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(formData.telefone.trim().replace(/\s/g, ''))
        ) {
          errors.telefone = 'Telefone deve ter formato válido (11) 99999-9999'
        }

        if (
          formData.whatsapp.trim() &&
          !/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(formData.whatsapp.trim().replace(/\s/g, ''))
        ) {
          errors.whatsapp = 'WhatsApp deve ter formato válido (11) 99999-9999'
        }

        if (formData.site.trim() && !/^https?:\/\/.+\..+/.test(formData.site.trim())) {
          errors.site = 'Site deve ser uma URL válida (incluindo http:// ou https://)'
        }
        break

      case 3: // Serviços
        if (formData.servicosSelecionados.length === 0) {
          errors.nome = 'Selecione pelo menos um serviço'
        }
        break

      case 4: // Horário
        if (formData.diasSelecionados.length === 0) {
          errors.horario_abertura = 'Selecione pelo menos um dia de funcionamento'
        }
        if (!formData.horario_abertura) {
          errors.horario_abertura = 'Horário de abertura é obrigatório'
        }
        if (!formData.horario_fechamento) {
          errors.horario_fechamento = 'Horário de fechamento é obrigatório'
        }
        if (formData.horario_abertura && formData.horario_fechamento) {
          if (formData.horario_abertura >= formData.horario_fechamento) {
            errors.horario_fechamento = 'Horário de fechamento deve ser posterior ao de abertura'
          }
        }
        break

      case 5: // Pagamento
        if (formData.pagamentosSelecionados.length === 0) {
          errors.nome = 'Selecione pelo menos uma forma de pagamento'
        }
        break

      case 6: // Imagens (opcional)
        break
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
    setFieldErrors(prev => ({ ...prev, latitude: undefined, longitude: undefined }))
  }

  const toggleServico = (servico: string, icone: string) => {
    setFormData(prev => {
      const exists = prev.servicosSelecionados.find(s => s.nome === servico)
      if (exists) {
        return {
          ...prev,
          servicosSelecionados: prev.servicosSelecionados.filter(s => s.nome !== servico),
        }
      } else {
        return {
          ...prev,
          servicosSelecionados: [...prev.servicosSelecionados, { nome: servico, valor: '', icone }],
        }
      }
    })
  }

  const toggleDia = (dia: string) => {
    setFormData(prev => {
      const exists = prev.diasSelecionados.includes(dia)
      if (exists) {
        return {
          ...prev,
          diasSelecionados: prev.diasSelecionados.filter(d => d !== dia),
        }
      } else {
        return {
          ...prev,
          diasSelecionados: [...prev.diasSelecionados, dia],
        }
      }
    })
  }

  const togglePagamento = (pagamento: string) => {
    setFormData(prev => {
      const exists = prev.pagamentosSelecionados.includes(pagamento)
      if (exists) {
        return {
          ...prev,
          pagamentosSelecionados: prev.pagamentosSelecionados.filter(p => p !== pagamento),
        }
      } else {
        return {
          ...prev,
          pagamentosSelecionados: [...prev.pagamentosSelecionados, pagamento],
        }
      }
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length + formData.imagens.length + formData.imagensExistentes.length > 5) {
      setError('Máximo de 5 imagens permitidas')
      return
    }

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      setError('Apenas imagens até 5MB são permitidas')
      return
    }

    const newPreviews: string[] = []
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        newPreviews.push(e.target?.result as string)
        if (newPreviews.length === validFiles.length) {
          setFormData(prev => ({
            ...prev,
            imagens: [...prev.imagens, ...validFiles],
            imagensPreview: [...prev.imagensPreview, ...newPreviews],
          }))
        }
      }
      reader.readAsDataURL(file)
    })

    setError('')
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index),
      imagensPreview: prev.imagensPreview.filter((_, i) => i !== index),
    }))
  }

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagensExistentes: prev.imagensExistentes.filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const enderecoCompleto = `${formData.rua}, ${formData.numero}${formData.complemento ? `, ${formData.complemento}` : ''}, ${formData.bairro}, ${formData.cidade} - ${formData.estado}, ${formData.cep}`

      // Upload das novas imagens
      const novasImagensUrls: string[] = []
      let uploadedImages = 0

      if (formData.imagens.length > 0) {
        try {
          console.log(`Tentando fazer upload de ${formData.imagens.length} novas imagens...`)
          const urls = await uploadMultipleImages(formData.imagens, 'oficinas')
          novasImagensUrls.push(...urls)
          uploadedImages = urls.length
          console.log(`${uploadedImages} novas imagens enviadas com sucesso`)
        } catch (uploadError) {
          console.error('Erro no upload das imagens:', uploadError)
        }
      }

      // Combinar imagens existentes com novas
      const todasImagens = [...formData.imagensExistentes, ...novasImagensUrls]

      // Atualizar dados da oficina (usando nomes corretos das colunas do banco)
      const oficinaData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim(),
        telefone_fixo: formData.telefone.trim(), // Coluna adicional no banco
        endereco: enderecoCompleto,
        descricao: formData.descricao.trim() || null, // Voltar para 'descricao' que existe
        status: formData.status,
        latitude: formData.latitude,
        longitude: formData.longitude,
        cnpj_cpf: formData.cnpj_cpf.trim() || null,
        razao_social: formData.razao_social.trim() || null,
        whatsapp: formData.whatsapp.trim() || null, // Coluna existe no banco
        site: formData.site.trim() || null, // Coluna existe no banco
        servicos_oferecidos:
          formData.servicosSelecionados.length > 0
            ? formData.servicosSelecionados.map(s => s.nome)
            : null, // Array de strings
        dias_funcionamento: formData.diasSelecionados.length > 0 ? formData.diasSelecionados : null, // Array de strings
        horario_abertura: formData.horario_abertura || null,
        horario_fechamento: formData.horario_fechamento || null,
        formas_pagamento:
          formData.pagamentosSelecionados.length > 0 ? formData.pagamentosSelecionados : null, // Array de strings
        // pagamento_outros: formData.pagamento_outros.trim() || null, // Coluna não existe
        // Usar foto_url para primeira imagem e imagens_urls como array
        foto_url: todasImagens.length > 0 ? todasImagens[0] : null,
        imagens_urls: todasImagens.length > 0 ? todasImagens : null, // Array de strings

        // Campos de endereço separados (que existem no banco)
        rua: formData.rua.trim() || null,
        numero: formData.numero.trim() || null,
        complemento: formData.complemento.trim() || null,
        bairro: formData.bairro.trim() || null,
        cidade: formData.cidade.trim() || null,
        estado: formData.estado.trim() || null,
        cep: formData.cep.trim() || null,
      }

      const { error } = await supabase.from('oficinas').update(oficinaData).eq('id', oficinaId)

      if (error) {
        console.error('Erro detalhado:', error)
        throw error
      }

      setSaving(false)

      const successMessage = `Oficina "${formData.nome}" atualizada com sucesso!${uploadedImages > 0 ? ` ${uploadedImages} nova(s) imagen(s) foi(ram) adicionada(s).` : ''}`
      success('Oficina atualizada!', successMessage)

      router.push('/admin/oficinas')
    } catch (err: unknown) {
      console.error('Erro completo:', err)

      let errorMessage = 'Erro ao atualizar oficina'

      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as Record<string, unknown>
        if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message
        } else if (typeof errorObj.details === 'string') {
          errorMessage = errorObj.details
        } else if (typeof errorObj.hint === 'string') {
          errorMessage = errorObj.hint
        }
      }

      setError(errorMessage)
      showError('Erro ao atualizar oficina', errorMessage)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminAuthGate>
        <AdminLayout>
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Carregando dados da oficina...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminAuthGate>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Dados básicos
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Nome da Oficina *</label>
                <Input
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Digite o nome da oficina"
                  className={fieldErrors.nome ? 'border-red-500' : ''}
                />
                {fieldErrors.nome && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.nome}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">CNPJ/CPF *</label>
                <Input
                  name="cnpj_cpf"
                  value={formData.cnpj_cpf}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  className={fieldErrors.cnpj_cpf ? 'border-red-500' : ''}
                />
                {fieldErrors.cnpj_cpf && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.cnpj_cpf}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Razão Social</label>
                <Input
                  name="razao_social"
                  value={formData.razao_social}
                  onChange={handleInputChange}
                  placeholder="Razão social da empresa"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email *</label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contato@oficina.com"
                  type="email"
                  className={fieldErrors.email ? 'border-red-500' : ''}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  className="h-10 w-full rounded-md border border-gray-300 px-3"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Descrição</label>
                <Textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Descreva a oficina, especialidades e diferenciais..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      // ... outros cases seguem o mesmo padrão da página de criação
      // Por brevidade, vou incluir apenas alguns casos principais

      case 1: // Endereço
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">CEP *</label>
                <Input
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                  className={fieldErrors.cep ? 'border-red-500' : ''}
                />
                {fieldErrors.cep && <p className="mt-1 text-sm text-red-500">{fieldErrors.cep}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Rua *</label>
                <Input
                  name="rua"
                  value={formData.rua}
                  onChange={handleInputChange}
                  placeholder="Nome da rua"
                  className={fieldErrors.rua ? 'border-red-500' : ''}
                />
                {fieldErrors.rua && <p className="mt-1 text-sm text-red-500">{fieldErrors.rua}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Número *</label>
                <Input
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  placeholder="123"
                  className={fieldErrors.numero ? 'border-red-500' : ''}
                />
                {fieldErrors.numero && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.numero}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Complemento</label>
                <Input
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleInputChange}
                  placeholder="Apto, Sala, etc."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Bairro *</label>
                <Input
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  placeholder="Nome do bairro"
                  className={fieldErrors.bairro ? 'border-red-500' : ''}
                />
                {fieldErrors.bairro && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.bairro}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Cidade *</label>
                <Input
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  placeholder="Nome da cidade"
                  className={fieldErrors.cidade ? 'border-red-500' : ''}
                />
                {fieldErrors.cidade && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.cidade}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Estado *</label>
                <Input
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  placeholder="SP"
                  className={fieldErrors.estado ? 'border-red-500' : ''}
                />
                {fieldErrors.estado && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.estado}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Localização no mapa *</label>
              <div className="h-64 w-full overflow-hidden rounded border">
                <Map
                  selectLocationMode={true}
                  onLocationSelect={handleMapClick}
                  marker={
                    formData.latitude !== null && formData.longitude !== null
                      ? { lat: formData.latitude, lng: formData.longitude }
                      : undefined
                  }
                  height="256px"
                />
              </div>
              <div className="mt-2">
                {formData.latitude !== null && formData.longitude !== null ? (
                  <div className="text-xs text-green-600">
                    ✓ Localização selecionada: {formData.latitude.toFixed(6)},{' '}
                    {formData.longitude.toFixed(6)}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    Clique no mapa para selecionar a localização
                  </div>
                )}
              </div>
              {fieldErrors.latitude && (
                <p className="mt-1 text-sm text-red-500">Selecione a localização no mapa</p>
              )}
            </div>
          </div>
        )

      case 2: // Contato
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Telefone Fixo *</label>
                <Input
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(11) 3333-4444"
                  className={fieldErrors.telefone ? 'border-red-500' : ''}
                />
                {fieldErrors.telefone && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.telefone}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">WhatsApp</label>
                <Input
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  className={fieldErrors.whatsapp ? 'border-red-500' : ''}
                />
                {fieldErrors.whatsapp && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.whatsapp}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Site</label>
                <Input
                  name="site"
                  value={formData.site}
                  onChange={handleInputChange}
                  placeholder="https://www.oficina.com.br"
                  className={fieldErrors.site ? 'border-red-500' : ''}
                />
                {fieldErrors.site && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.site}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3: // Serviços
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-4 block text-sm font-medium">
                Selecione os serviços oferecidos *
              </label>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {servicosList.map(servico => (
                  <div
                    key={servico.nome}
                    onClick={() => toggleServico(servico.nome, servico.icone)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                      formData.servicosSelecionados.find(s => s.nome === servico.nome)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Image
                        src={servico.icone}
                        alt={servico.nome}
                        width={32}
                        height={32}
                        className="mb-2"
                      />
                      <span className="text-sm font-medium">{servico.nome}</span>
                    </div>
                  </div>
                ))}
              </div>
              {fieldErrors.nome && currentStep === 3 && (
                <p className="mt-2 text-sm text-red-500">{fieldErrors.nome}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Outros serviços (opcional)</label>
              <Textarea
                name="servico_outros"
                value={formData.servico_outros}
                onChange={handleInputChange}
                placeholder="Descreva outros serviços não listados acima..."
                rows={3}
              />
            </div>
          </div>
        )

      case 4: // Horário
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-4 block text-sm font-medium">Dias de funcionamento *</label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {diasSemana.map(dia => (
                  <div
                    key={dia}
                    onClick={() => toggleDia(dia)}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      formData.diasSelecionados.includes(dia)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{dia}</span>
                  </div>
                ))}
              </div>
              {fieldErrors.horario_abertura && (
                <p className="mt-2 text-sm text-red-500">{fieldErrors.horario_abertura}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Horário de Abertura *</label>
                <Input
                  name="horario_abertura"
                  type="time"
                  value={formData.horario_abertura}
                  onChange={handleInputChange}
                  className={fieldErrors.horario_abertura ? 'border-red-500' : ''}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Horário de Fechamento *</label>
                <Input
                  name="horario_fechamento"
                  type="time"
                  value={formData.horario_fechamento}
                  onChange={handleInputChange}
                  className={fieldErrors.horario_fechamento ? 'border-red-500' : ''}
                />
                {fieldErrors.horario_fechamento && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.horario_fechamento}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 5: // Pagamento
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-4 block text-sm font-medium">
                Formas de pagamento aceitas *
              </label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {formasPagamento.map(pagamento => (
                  <div
                    key={pagamento}
                    onClick={() => togglePagamento(pagamento)}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      formData.pagamentosSelecionados.includes(pagamento)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{pagamento}</span>
                  </div>
                ))}
              </div>
              {fieldErrors.nome && currentStep === 5 && (
                <p className="mt-2 text-sm text-red-500">{fieldErrors.nome}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Outras formas de pagamento (opcional)
              </label>
              <Textarea
                name="pagamento_outros"
                value={formData.pagamento_outros}
                onChange={handleInputChange}
                placeholder="Descreva outras formas de pagamento..."
                rows={3}
              />
            </div>
          </div>
        )

      case 6: // Imagens
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-4 block text-sm font-medium">Imagens da Oficina</label>
              <p className="mb-4 text-sm text-gray-600">
                Adicione até 5 imagens da sua oficina. Formatos aceitos: JPG, PNG. Tamanho máximo:
                5MB por imagem.
              </p>

              {/* Imagens existentes */}
              {formData.imagensExistentes.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium">Imagens atuais:</h4>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {formData.imagensExistentes.map((url, index) => (
                      <div key={index} className="group relative">
                        <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={url}
                            alt={`Imagem existente ${index + 1}`}
                            width={200}
                            height={150}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload de novas imagens */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
                <input
                  type="file"
                  id="imagens"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="imagens" className="flex cursor-pointer flex-col items-center">
                  <Upload className="mb-4 h-12 w-12 text-gray-400" />
                  <span className="mb-2 text-lg font-medium text-gray-700">
                    Clique para adicionar novas imagens
                  </span>
                  <span className="text-sm text-gray-500">ou arraste e solte aqui</span>
                </label>
              </div>

              {/* Preview das novas imagens */}
              {formData.imagensPreview.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-medium">Novas imagens a serem adicionadas:</h4>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {formData.imagensPreview.map((preview, index) => (
                      <div key={index} className="group relative">
                        <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={preview}
                            alt={`Nova imagem ${index + 1}`}
                            width={200}
                            height={150}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Total: {formData.imagensExistentes.length + formData.imagens.length}/5 imagens
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AdminAuthGate>
      <AdminLayout>
        <div className="mx-auto max-w-4xl py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/oficinas')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
            <h1 className="mb-2 text-3xl font-bold">Editar Oficina</h1>
            <p className="text-muted-foreground">
              Atualize os dados da oficina &quot;{formData.nome}&quot;
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                return (
                  <div key={index} className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : isActive
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 w-12 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
              <p className="text-sm text-muted-foreground">
                Passo {currentStep + 1} de {steps.length}
              </p>
            </div>
          </div>

          {/* Form content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps[currentStep].icon, { className: 'w-5 h-5' })}
                {steps[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}

              {error && (
                <div className="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 0 ? () => router.push('/admin/oficinas') : prevStep}
              disabled={saving}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {currentStep === 0 ? 'Cancelar' : 'Anterior'}
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep} disabled={saving}>
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Salvando...' : 'Atualizar Oficina'}
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGate>
  )
}
