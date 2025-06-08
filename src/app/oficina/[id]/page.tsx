"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  MessageCircle
} from "lucide-react"
import dynamic from "next/dynamic"

// Dinamically import map component
const MapComponent = dynamic(() => import("@/components/OfficeDetailMap").then(mod => ({ default: mod.default })), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse">Carregando mapa...</div>
})

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
}

export default function OfficeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchOficina = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from("oficinas")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error) {
          console.error("Erro ao buscar oficina:", error)
        } else {
          setOficina(data as Oficina)
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOficina()
  }, [params.id])

  const handleRouteClick = () => {
    if (oficina) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${oficina.latitude},${oficina.longitude}`
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
          <div className="text-center space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 rounded-full loading-rotate opacity-80"></div>
              <div className="absolute inset-1 bg-white rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wrench className="w-8 h-8 text-blue-600 loading-bounce" />
              </div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
          <div className="text-center space-y-6">
            <div className="text-6xl">🚗</div>
            <h2 className="text-3xl font-bold text-gray-800">Oficina não encontrada</h2>
            <p className="text-gray-600">A oficina que você está procurando não existe ou foi removida.</p>
            <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <Image
            src={oficina.foto_url || "/placeholder.svg"}
            alt={oficina.nome}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          
          {/* Navigation and Actions */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <Button
              variant="ghost"
              onClick={toggleFavorite}
              className={`bg-white/10 backdrop-blur-sm border border-white/20 ${
                isFavorite ? 'text-red-500' : 'text-white hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Office Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{oficina.nome}</h1>
                  <p className="text-white/90 flex items-center text-lg">
                    <MapPin className="w-5 h-5 mr-2" />
                    {oficina.endereco}
                  </p>
                </div>
                
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-current text-yellow-500 mr-2" />
                    <span className="font-bold text-gray-800">{oficina.avaliacao || 4.8}</span>
                    <span className="text-gray-600 ml-1">({oficina.total_avaliacoes || 127} avaliações)</span>
                  </div>
                </div>
              </div>

              {/* Status and Category */}
              <div className="flex gap-3">
                <Badge className="bg-green-500 hover:bg-green-500 text-white px-3 py-1.5">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  Online
                </Badge>
                {oficina.category && (
                  <Badge variant="outline" className="bg-white/90 text-gray-800 border-white/50">
                    {oficina.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={handleRouteClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Como chegar
                </Button>
                
                <Button 
                  onClick={handleCallClick}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {oficina.telefone || "Ligar"}
                </Button>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-blue-600" />
                    Sobre a oficina
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {oficina.descricao || 
                      `${oficina.nome} é uma oficina especializada em serviços automotivos de qualidade. 
                      Com anos de experiência no mercado, oferecemos uma ampla gama de serviços para 
                      manter seu veículo sempre em perfeitas condições. Nossa equipe técnica é altamente 
                      qualificada e utiliza equipamentos de última geração para garantir o melhor resultado.`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2 text-blue-600" />
                    Serviços disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(oficina.especialidades || [
                      'Troca de óleo',
                      'Revisão geral',
                      'Alinhamento',
                      'Balanceamento',
                      'Freios',
                      'Suspensão',
                      'Ar-condicionado',
                      'Elétrica',
                      'Mecânica geral'
                    ]).map((servico, index) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-700">{servico}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Location Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden">
                    <MapComponent 
                      latitude={oficina.latitude}
                      longitude={oficina.longitude}
                      nome={oficina.nome}
                      endereco={oficina.endereco}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {oficina.endereco}
                  </p>
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
                      <Phone className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-gray-700">{oficina.telefone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-gray-700">
                      {oficina.horario_funcionamento || "Seg-Sex: 8h-18h, Sáb: 8h-12h"}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-gray-700 text-sm">{oficina.endereco}</span>
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
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="text-gray-700">Avaliação</span>
                    </div>
                    <span className="font-bold">{oficina.avaliacao || 4.8}/5</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-gray-700">Clientes</span>
                    </div>
                    <span className="font-bold">{oficina.total_avaliacoes || 127}+</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-gray-700">Experiência</span>
                    </div>
                    <span className="font-bold">15+ anos</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-green-500" />
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
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar serviço
                  </Button>
                  
                  <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar mensagem
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleRouteClick}
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
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
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-600 text-sm">Serviços a partir de</p>
                    <p className="text-3xl font-bold text-blue-600">
                      R$ {oficina.preco_medio || 50}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">*Consulte condições</p>
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
