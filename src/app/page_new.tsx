"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import OfficeCard from "@/components/OfficeCard"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, List, Search, X, Wrench, Star, Shield, Clock, Award } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const WorkshopMap = dynamic(() => import("@/components/WorkshopMap"), { 
  ssr: false,
  loading: () => <div>Loading map...</div>
})

interface UserData {
  nome?: string
  email?: string
  role?: string
  photoURL?: string
}

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
}

export default function Home() {
  const [, setUserData] = useState<UserData | null>(null)
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredOficinas, setFilteredOficinas] = useState<Oficina[]>([])
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Error fetching user:", authError)
        setUserData(null)
        setLoading(false)
        return
      }

      if (user) {
        try {
          const { data: userDoc, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single()

          if (userError) {
            console.error("Error fetching user data:", userError)
          } else {
            setUserData(userDoc as UserData)
          }
        } catch (error) {
          console.error("Unexpected error fetching user data:", error)
        }
      } else {
        setUserData(null)
      }
      setLoading(false)
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    async function fetchOficinas() {
      try {
        console.log("Iniciando busca de oficinas...")
        
        const { data: testConnection, error: connectionError } = await supabase
          .from("oficinas")
          .select("count", { count: "exact", head: true })
        
        if (connectionError) {
          console.error("Erro de conexão com Supabase:", connectionError)
          setOficinas([])
          setLoading(false)
          return
        }
        
        console.log("Conexão com Supabase OK. Registros encontrados:", testConnection)
        
        const { data, error } = await supabase
          .from("oficinas")
          .select("*")
        
        if (error) {
          console.error("Erro detalhado ao buscar oficinas:", error)
          setOficinas([])
        } else {
          console.log("Dados brutos encontrados:", data)
          
          const oficinasComCoordenadas = (data as Oficina[])?.filter(
            oficina => oficina.latitude != null && oficina.longitude != null
          ) || []
          
          console.log("Oficinas com coordenadas válidas:", oficinasComCoordenadas.length)
          setOficinas(oficinasComCoordenadas)
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar oficinas:", err)
        setOficinas([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchOficinas()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    let filtered = oficinas
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(
        (oficina) =>
          oficina.nome?.toLowerCase().includes(term) ||
          oficina.endereco?.toLowerCase().includes(term)
      )
    }
    if (selectedCategory) {
      filtered = filtered.filter((oficina) => oficina.category === selectedCategory)
    }
    setFilteredOficinas(filtered)
  }, [debouncedSearchTerm, selectedCategory, oficinas])

  const checkScrollArrows = useCallback(() => {
    const container = document.getElementById('categories-container')
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    const container = document.getElementById('categories-container')
    if (container) {
      container.addEventListener('scroll', checkScrollArrows)
      
      const timeoutId = setTimeout(checkScrollArrows, 100)
      
      const resizeObserver = new ResizeObserver(() => {
        checkScrollArrows()
      })
      resizeObserver.observe(container)
      
      return () => {
        container.removeEventListener('scroll', checkScrollArrows)
        resizeObserver.disconnect()
        clearTimeout(timeoutId)
      }
    }
  }, [checkScrollArrows])
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }
  
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                Carregando oficinas
              </h2>
              <p className="text-gray-600">
                Encontrando as melhores opções para você
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const categories = [
    { id: "troca-oleo", name: "Troca de óleo", icon: "/oleo.png" },
    { id: "avaliacao", name: "Avaliação", icon: "/avaliacao.png" },
    { id: "pelicula", name: "Película", icon: "/pelicula.png" },
    { id: "filtros", name: "Filtros", icon: "/filtro.png" },
    { id: "alinhamento", name: "Alinhamento", icon: "/balanceamento.png" },
    { id: "pastilhas", name: "Pastilhas", icon: "/freio.png" },
    { id: "polimento", name: "Polimento", icon: "/polimento.png" },
    { id: "acessorios", name: "Acessórios", icon: "/acessorios.png" },
    { id: "ar-condicionado", name: "Ar-condicionado", icon: "/ar-condicionado.png" },
    { id: "higienizacao", name: "Higienização", icon: "/higienizacao.png" },
    { id: "mecanica-geral", name: "Mecânica Geral", icon: "/oleo.png" },
    { id: "eletrica", name: "Elétrica", icon: "/eletrica.png" },
    { id: "freios", name: "Freios", icon: "/freio.png" },
    { id: "suspensao", name: "Suspensão", icon: "/susp.png" },
    { id: "escape", name: "Escape", icon: "/escape.png" },
    { id: "bateria", name: "Bateria", icon: "/bateria.png" },
    { id: "pneus", name: "Pneus", icon: "/balanceamento.png" },
    { id: "injecao", name: "Injeção", icon: "/injecao.png" }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Hero Section - Inspired by Airbnb */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Encontre a oficina
              <span className="block text-blue-600">perfeita para seu carro</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Conectamos você com oficinas especializadas e confiáveis. Compare preços, avaliações e escolha a melhor opção.
            </p>
            
            {/* Search Bar - Clean Design */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex-1 flex items-center px-6 py-4">
                    <Search className="text-gray-400 h-5 w-5 mr-3 flex-shrink-0" />
                    <Input
                      type="text"
                      placeholder="Buscar oficinas por nome ou localização..."
                      className="flex-1 border-none outline-none shadow-none bg-transparent p-0 text-base placeholder:text-gray-500"
                      value={searchTerm}
                      onChange={handleSearch}
                      style={{ boxShadow: 'none' }}
                    />
                    {searchTerm && (
                      <button
                        className="text-gray-400 hover:text-gray-600 ml-3 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
                        onClick={() => setSearchTerm("")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full">
                    Buscar
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 mx-auto">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
                <div className="text-gray-600">Oficinas Parceiras</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 mx-auto">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">4.8★</div>
                <div className="text-gray-600">Avaliação Média</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4 mx-auto">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">24h</div>
                <div className="text-gray-600">Atendimento</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
                <div className="text-gray-600">Garantia</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Serviços Disponíveis</h2>
          
          <div className="relative">
            {/* Categories navigation */}
            {showLeftArrow && (
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-300"
                onClick={() => {
                  const container = document.getElementById('categories-container');
                  if (container) {
                    container.scrollBy({ left: -200, behavior: 'smooth' });
                  }
                }}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {showRightArrow && (
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-300"
                onClick={() => {
                  const container = document.getElementById('categories-container');
                  if (container) {
                    container.scrollBy({ left: 200, behavior: 'smooth' });
                  }
                }}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Categories container */}
            <div 
              id="categories-container"
              className="flex items-center overflow-x-auto scrollbar-hide gap-4 py-4 mx-8"
              onScroll={checkScrollArrows}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`
                    flex flex-col items-center gap-2 min-w-[80px] cursor-pointer transition-all duration-300
                    ${selectedCategory === category.id ? "text-blue-600" : "text-gray-600 hover:text-blue-500"}
                  `}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div
                    className={`
                      relative p-3 rounded-xl transition-all duration-300 border-2
                      ${selectedCategory === category.id 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg" 
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }
                    `}
                  >
                    <Image
                      src={category.icon || "/placeholder.svg"}
                      alt={category.name}
                      width={24}
                      height={24}
                      className={`h-6 w-6 transition-all duration-300 ${
                        selectedCategory === category.id 
                          ? "brightness-0 invert" 
                          : ""
                      }`}
                    />
                    {selectedCategory === category.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <span className="text-sm text-center font-medium">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active filters */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {selectedCategory && (
                <Badge variant="outline" className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 px-3 py-1">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 px-3 py-1">
                  Busca: {searchTerm}
                  <button onClick={() => setSearchTerm("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-800">
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Map Toggle Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => setShowMap(!showMap)}
          className={`
            w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110
            ${showMap 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-blue-600 hover:bg-blue-700'
            }
            text-white border-2 border-white
          `}
        >
          {showMap ? (
            <List className="h-6 w-6" />
          ) : (
            <MapPin className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Main Content */}
      {!showMap ? (
        <main className="flex-1 bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results header */}
            {filteredOficinas.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {filteredOficinas.length} oficinas encontradas
                </h2>
                <p className="text-gray-600">
                  {selectedCategory ? `Filtrando por ${categories.find(c => c.id === selectedCategory)?.name}` : 'Todas as oficinas disponíveis'}
                </p>
              </div>
            )}

            {/* Office Cards Grid */}
            {filteredOficinas.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOficinas.map((oficina, index) => (
                  <div 
                    key={oficina.id} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <OfficeCard oficina={oficina} />
                  </div>
                ))}
              </div>
            )}

            {/* No results state */}
            {filteredOficinas.length === 0 && (
              <div className="text-center py-24">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Nenhuma oficina encontrada</h3>
                  <p className="text-gray-600 mb-6">
                    Tente ajustar os filtros ou buscar por outros termos.
                  </p>
                  <Button 
                    onClick={clearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    Limpar filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      ) : (
        <main className="flex-1 bg-white">
          <div className="h-[600px]">
            <WorkshopMap
              workshops={filteredOficinas.map((oficina) => ({
                id: String(oficina.id),
                nome: oficina.nome,
                endereco: oficina.endereco,
                latitude: oficina.latitude,
                longitude: oficina.longitude,
                foto_url: oficina.foto_url,
                telefone: oficina.telefone,
              }))}
              height="100%"
            />
          </div>
        </main>
      )}
      
      <Footer />
    </div>
  )
}
