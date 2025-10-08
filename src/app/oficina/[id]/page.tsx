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
  const { error: showError } = useAppNotifications()

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
          oficina.cep
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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
          <div className="space-y-8 text-center">
            <div className="relative mx-auto h-32 w-32">
              <div className="loading-rotate absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 opacity-80"></div>
              <div className="absolute inset-1 rounded-full bg-white"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wrench className="loading-bounce h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
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
        <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
          <div className="space-y-6 text-center">
            <div className="text-6xl">🚗</div>
            <h2 className="text-3xl font-bold text-gray-800">Oficina não encontrada</h2>
            <p className="text-gray-600">
              A oficina que você está procurando não existe ou foi removida.
            </p>
            <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
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
                <Badge className="bg-green-500 px-3 py-1.5 text-white hover:bg-green-500">
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
                  onClick={handleRouteClick}
                  className="h-14 rounded-xl bg-blue-600 text-lg text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  Como chegar
                </Button>

                <Button
                  onClick={handleCallClick}
                  variant="outline"
                  className="h-14 rounded-xl border-blue-200 text-lg text-blue-600 shadow-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-xl"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {oficina.telefone || 'Ligar'}
                </Button>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-blue-600" />
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
                    <Car className="mr-2 h-5 w-5 text-blue-600" />
                    Serviços disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(
                      oficina.especialidades || [
                        'Troca de óleo',
                        'Revisão geral',
                        'Alinhamento',
                        'Balanceamento',
                        'Freios',
                        'Suspensão',
                        'Ar-condicionado',
                        'Elétrica',
                        'Mecânica geral',
                      ]
                    ).map((servico, index) => (
                      <div key={index} className="flex items-center rounded-lg bg-blue-50 p-3">
                        <div className="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-gray-700">{servico}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Location Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Endereço */}
                    <div className="flex items-start rounded-lg bg-blue-50 p-4">
                      <MapPin className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{oficina.nome}</p>
                        <p className="mt-1 text-sm text-gray-600">{oficina.endereco}</p>
                        {oficina.latitude && oficina.longitude && (
                          <p className="mt-1 text-xs text-gray-500">
                            Coordenadas: {oficina.latitude.toFixed(6)}, {oficina.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botão para abrir no Google Maps */}
                    <Button
                      onClick={handleRouteClick}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
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
                      <Users className="mr-2 h-4 w-4 text-blue-500" />
                      <span className="text-gray-700">Clientes</span>
                    </div>
                    <span className="font-bold">{oficina.total_avaliacoes || 127}+</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="mr-2 h-4 w-4 text-purple-500" />
                      <span className="text-gray-700">Experiência</span>
                    </div>
                    <span className="font-bold">15+ anos</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
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
                  <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar serviço
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar mensagem
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleRouteClick}
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
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
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <p className="text-sm text-gray-600">Serviços a partir de</p>
                    <p className="text-3xl font-bold text-blue-600">
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

      <Footer />
    </div>
  )
}
