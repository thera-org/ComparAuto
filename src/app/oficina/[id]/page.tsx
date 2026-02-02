'use client'

import {
  MapPin,
  Phone,
  Clock,
  Star,
  Heart,
  Navigation,
  ArrowLeft,
  Calendar,
  Wrench,
  Car,
  Shield,
  Award,
  Users,
  MessageCircle,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppNotifications } from '@/hooks/useAppNotifications'
import { supabase } from '@/lib/supabase'

interface Oficina {
  id: string
  nome: string
  endereco: string
  latitude: number
  longitude: number
  foto_url?: string
  telefone?: string
  status?: string
  category?: string
  descricao?: string
  horario_funcionamento?: string
  especialidades?: string[]
  servicos_oferecidos?: string[]
  preco_medio?: number
  avaliacao?: number
  total_avaliacoes?: number
  // Campos de endereço detalhado
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
}

export default function OfficeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAgendamento, setShowAgendamento] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { error: showError, success } = useAppNotifications()

  const [agendamentoForm, setAgendamentoForm] = useState({
    tipo_servico: '',
    marca_veiculo: '',
    modelo_veiculo: '',
    ano_veiculo: '',
    versao_veiculo: '',
    data_preferencial: '',
    periodo: '',
    descricao: '',
    nome_cliente: '',
    telefone_cliente: '',
  })

  useEffect(() => {
    const fetchOficina = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from('oficinas')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) {
          console.error('Erro ao buscar oficina:', error)
          showError('Erro ao carregar oficina', 'Não foi possível carregar os detalhes da oficina')
        } else {
          setOficina(data as Oficina)
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        showError('Erro inesperado', 'Erro inesperado ao carregar a oficina')
      } finally {
        setLoading(false)
      }
    }

    fetchOficina()
  }, [params.id, showError])

  const handleRouteClick = () => {
    if (oficina) {
      let destination = ''

      // Prioridade 1: Montar endereço completo dos campos separados
      if (oficina.rua && oficina.numero && oficina.cidade && oficina.estado) {
        const enderecoCompleto = [
          oficina.rua,
          oficina.numero,
          oficina.complemento,
          oficina.bairro,
          oficina.cidade,
          oficina.estado,
          oficina.cep,
        ]
          .filter(Boolean) // Remove valores vazios/null/undefined
          .join(', ')

        destination = encodeURIComponent(enderecoCompleto)
      }
      // Prioridade 2: Usar o campo endereco completo
      else if (oficina.endereco) {
        destination = encodeURIComponent(oficina.endereco)
      }
      // Prioridade 3: Usar coordenadas se estiverem disponíveis
      else if (
        oficina.latitude &&
        oficina.longitude &&
        oficina.latitude !== 0 &&
        oficina.longitude !== 0 &&
        !isNaN(oficina.latitude) &&
        !isNaN(oficina.longitude)
      ) {
        destination = `${oficina.latitude},${oficina.longitude}`
      }
      // Fallback final: buscar pelo nome
      else {
        destination = encodeURIComponent(oficina.nome)
      }

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`
      window.open(googleMapsUrl, '_blank')
    }
  }

  const handleCallClick = () => {
    if (oficina?.telefone) {
      window.open(`tel:${oficina.telefone}`, '_self')
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleAgendamentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        showError('Não autenticado', 'Você precisa estar logado para agendar um serviço')
        router.push('/login')
        return
      }

      const { error } = await supabase.from('agendamentos').insert({
        user_id: user.id,
        oficina_id: oficina?.id,
        tipo_servico: agendamentoForm.tipo_servico,
        marca_veiculo: agendamentoForm.marca_veiculo,
        modelo_veiculo: agendamentoForm.modelo_veiculo,
        ano_veiculo: agendamentoForm.ano_veiculo,
        versao_veiculo: agendamentoForm.versao_veiculo,
        data_preferencial: agendamentoForm.data_preferencial,
        periodo: agendamentoForm.periodo,
        descricao: agendamentoForm.descricao,
        nome_cliente: agendamentoForm.nome_cliente,
        telefone_cliente: agendamentoForm.telefone_cliente,
        status: 'pendente',
      })

      if (error) throw error

      success(
        'Sucesso!',
        'Agendamento solicitado com sucesso! A oficina entrará em contato em breve.'
      )
      setShowAgendamento(false)
      setAgendamentoForm({
        tipo_servico: '',
        marca_veiculo: '',
        modelo_veiculo: '',
        ano_veiculo: '',
        versao_veiculo: '',
        data_preferencial: '',
        periodo: '',
        descricao: '',
        nome_cliente: '',
        telefone_cliente: '',
      })
    } catch (err) {
      console.error('Erro ao criar agendamento:', err)
      showError('Erro', 'Não foi possível solicitar o agendamento. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 via-primary/5 to-gray-100">
          <div className="space-y-8 text-center">
            <div className="relative mx-auto h-32 w-32">
              <div className="loading-rotate absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-primary to-primary-hover opacity-80"></div>
              <div className="absolute inset-1 rounded-full bg-white"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wrench className="loading-bounce h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-2xl font-bold text-transparent">
              Carregando detalhes da oficina...
            </h2>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!oficina) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="space-y-6 text-center">
            <div className="text-6xl">🚗</div>
            <h2 className="text-3xl font-bold text-gray-800">Oficina não encontrada</h2>
            <p className="text-gray-600">
              A oficina que você está procurando não existe ou foi removida.
            </p>
            <Button onClick={() => router.back()} className="bg-primary hover:bg-primary-hover">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <Image
            src={oficina.foto_url || '/placeholder.svg'}
            alt={oficina.nome}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

          {/* Navigation and Actions */}
          <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <Button
              variant="ghost"
              onClick={toggleFavorite}
              className={`border border-white/20 bg-white/10 backdrop-blur-sm ${
                isFavorite ? 'text-red-500' : 'text-white hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Office Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-4xl font-bold text-white">{oficina.nome}</h1>
                  <p className="flex items-center text-lg text-white/90">
                    <MapPin className="mr-2 h-5 w-5" />
                    {oficina.endereco}
                  </p>
                </div>

                <div className="rounded-xl bg-white/95 px-4 py-2 backdrop-blur-sm">
                  <div className="flex items-center">
                    <Star className="mr-2 h-5 w-5 fill-current text-yellow-500" />
                    <span className="font-bold text-gray-800">{oficina.avaliacao || 4.8}</span>
                    <span className="ml-1 text-gray-600">
                      ({oficina.total_avaliacoes || 127} avaliações)
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Category */}
              <div className="flex gap-3">
                <Badge className="bg-primary px-3 py-1.5 text-white hover:bg-primary">
                  <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-white"></div>
                  Online
                </Badge>
                {oficina.category && (
                  <Badge variant="outline" className="border-white/50 bg-white/90 text-gray-800">
                    {oficina.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button
                  onClick={() => setShowAgendamento(true)}
                  className="h-14 rounded-xl bg-primary text-lg text-white shadow-lg transition-all duration-300 hover:bg-primary-hover hover:shadow-xl"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar serviço
                </Button>

                <Button
                  onClick={handleCallClick}
                  variant="outline"
                  className="h-14 rounded-xl border-primary/20 text-lg text-primary shadow-lg transition-all duration-300 hover:bg-primary/5 hover:shadow-xl"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {oficina.telefone || 'Ligar'}
                </Button>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-primary" />
                    Sobre a oficina
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-gray-700">
                    {oficina.descricao ||
                      `${oficina.nome} é uma oficina especializada em serviços automotivos de qualidade. 
                      Com anos de experiência no mercado, oferecemos uma ampla gama de serviços para 
                      manter seu veículo sempre em perfeitas condições. Nossa equipe técnica é altamente 
                      qualificada e utiliza equipamentos de última geração para garantir o melhor resultado.`}
                  </p>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="mr-2 h-5 w-5 text-primary" />
                    Serviços disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {oficina.servicos_oferecidos && oficina.servicos_oferecidos.length > 0 ? (
                      oficina.servicos_oferecidos.map((servico, index) => (
                        <div key={index} className="flex items-center rounded-lg bg-primary/5 p-3">
                          <div className="mr-3 h-2 w-2 rounded-full bg-primary"></div>
                          <span className="text-sm font-medium text-gray-700">{servico}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-4 text-center text-gray-500 sm:col-span-3">
                        <p className="text-sm">Nenhum serviço cadastrado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Endereço */}
                    <div className="flex items-start rounded-lg bg-primary/5 p-4">
                      <MapPin className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900">{oficina.nome}</p>
                        <p className="mt-1 text-sm text-gray-600">{oficina.endereco}</p>
                        {oficina.latitude && oficina.longitude && (
                          <p className="mt-1 text-xs text-gray-500">
                            Coordenadas: {oficina.latitude.toFixed(6)},{' '}
                            {oficina.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botão para abrir no Google Maps */}
                    <Button
                      onClick={handleRouteClick}
                      className="w-full bg-primary text-white hover:bg-primary-hover"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Ver no Google Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações de contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {oficina.telefone && (
                    <div className="flex items-center">
                      <Phone className="mr-3 h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{oficina.telefone}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Clock className="mr-3 h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {oficina.horario_funcionamento || 'Seg-Sex: 8h-18h, Sáb: 8h-12h'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="mr-3 h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{oficina.endereco}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="mr-2 h-4 w-4 text-yellow-500" />
                      <span className="text-gray-700">Avaliação</span>
                    </div>
                    <span className="font-bold">{oficina.avaliacao || 4.8}/5</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-gray-700">Clientes</span>
                    </div>
                    <span className="font-bold">{oficina.total_avaliacoes || 127}+</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-gray-700">Experiência</span>
                    </div>
                    <span className="font-bold">15+ anos</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-gray-700">Garantia</span>
                    </div>
                    <span className="font-bold">6 meses</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setShowAgendamento(true)}
                    className="w-full bg-primary text-white hover:bg-primary-hover"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar serviço
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar mensagem
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleRouteClick}
                    className="w-full border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Ver rota
                  </Button>
                </CardContent>
              </Card>

              {/* Price Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-primary/5 p-4 text-center">
                    <p className="text-sm text-gray-600">Serviços a partir de</p>
                    <p className="text-3xl font-bold text-primary">
                      R$ {oficina.preco_medio || 50}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">*Consulte condições</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Agendamento */}
      {showAgendamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header do Modal */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Agendar Serviço</h2>
                  <p className="text-sm text-gray-500">{oficina.nome}</p>
                </div>
                <button
                  onClick={() => setShowAgendamento(false)}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              <form onSubmit={handleAgendamentoSubmit} className="space-y-6">
                {/* Seleção de Serviço */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tipo de Serviço *
                  </label>
                  <select
                    required
                    value={agendamentoForm.tipo_servico}
                    onChange={e =>
                      setAgendamentoForm({ ...agendamentoForm, tipo_servico: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Selecione o serviço</option>
                    <option value="troca-oleo">Troca de Óleo</option>
                    <option value="revisao">Revisão Geral</option>
                    <option value="diagnostico">Diagnóstico Completo</option>
                    <option value="alinhamento">Alinhamento e Balanceamento</option>
                    <option value="freios">Manutenção de Freios</option>
                    <option value="suspensao">Suspensão</option>
                    <option value="eletrica">Elétrica</option>
                    <option value="ar-condicionado">Ar-condicionado</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                {/* Informações do Veículo */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Marca do Veículo *
                    </label>
                    <input
                      type="text"
                      required
                      value={agendamentoForm.marca_veiculo}
                      onChange={e =>
                        setAgendamentoForm({ ...agendamentoForm, marca_veiculo: e.target.value })
                      }
                      placeholder="Ex: Honda, Toyota, Fiat"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Modelo *</label>
                    <input
                      type="text"
                      required
                      value={agendamentoForm.modelo_veiculo}
                      onChange={e =>
                        setAgendamentoForm({ ...agendamentoForm, modelo_veiculo: e.target.value })
                      }
                      placeholder="Ex: Civic, Corolla"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Ano</label>
                    <input
                      type="text"
                      value={agendamentoForm.ano_veiculo}
                      onChange={e =>
                        setAgendamentoForm({ ...agendamentoForm, ano_veiculo: e.target.value })
                      }
                      placeholder="Ex: 2020"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Versão</label>
                    <input
                      type="text"
                      value={agendamentoForm.versao_veiculo}
                      onChange={e =>
                        setAgendamentoForm({ ...agendamentoForm, versao_veiculo: e.target.value })
                      }
                      placeholder="Ex: LX, EX, Sport"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Data e Horário Preferencial */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Data Preferencial *
                    </label>
                    <input
                      type="date"
                      required
                      value={agendamentoForm.data_preferencial}
                      onChange={e =>
                        setAgendamentoForm({
                          ...agendamentoForm,
                          data_preferencial: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Período *
                    </label>
                    <select
                      required
                      value={agendamentoForm.periodo}
                      onChange={e =>
                        setAgendamentoForm({ ...agendamentoForm, periodo: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Selecione</option>
                      <option value="manha">Manhã (8h - 12h)</option>
                      <option value="tarde">Tarde (13h - 18h)</option>
                    </select>
                  </div>
                </div>

                {/* Descrição do Problema */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Descreva o problema ou serviço necessário
                  </label>
                  <textarea
                    rows={4}
                    value={agendamentoForm.descricao}
                    onChange={e =>
                      setAgendamentoForm({ ...agendamentoForm, descricao: e.target.value })
                    }
                    placeholder="Conte-nos mais detalhes sobre o que precisa ser feito no veículo..."
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  ></textarea>
                </div>

                {/* Contato */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={agendamentoForm.nome_cliente}
                      onChange={e =>
                        setAgendamentoForm({ ...agendamentoForm, nome_cliente: e.target.value })
                      }
                      placeholder="Nome completo"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={agendamentoForm.telefone_cliente}
                      onChange={e =>
                        setAgendamentoForm({ ...agendamentoForm, telefone_cliente: e.target.value })
                      }
                      placeholder="(00) 00000-0000"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Informação Importante */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <span className="material-icons-outlined text-blue-600">info</span>
                    <div>
                      <h4 className="mb-1 text-sm font-bold text-gray-900">
                        Confirmação do Agendamento
                      </h4>
                      <p className="text-xs leading-relaxed text-gray-600">
                        A oficina entrará em contato para confirmar a disponibilidade e fornecer um
                        orçamento detalhado antes da realização do serviço.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-4 border-t border-gray-200 pt-6">
                  <Button
                    type="button"
                    onClick={() => setShowAgendamento(false)}
                    variant="outline"
                    disabled={submitting}
                    className="flex-1 rounded-lg border-gray-300 py-3 font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-primary py-3 font-semibold text-white shadow-sm shadow-primary/30 transition hover:brightness-90 disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Solicitar Agendamento'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
