"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import OfficeCard from "@/components/OfficeCard"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, List, Search, X, Wrench } from "lucide-react"
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
        }      } else {
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
        
        // Primeiro, vamos verificar se conseguimos conectar com o Supabase
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
        
        // Agora buscar os dados completos
        const { data, error } = await supabase
          .from("oficinas")
          .select("*")
        
        if (error) {
          console.error("Erro detalhado ao buscar oficinas:", error)
          console.error("Código do erro:", error.code)
          console.error("Mensagem do erro:", error.message)
          console.error("Detalhes do erro:", error.details)
          setOficinas([])
        } else {
          console.log("Dados brutos encontrados:", data)
          console.log("Número total de registros:", data?.length || 0)
          
          // Filtrar apenas oficinas com coordenadas válidas
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

  // Debounce para o searchTerm para melhorar performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms de delay

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
  }, [debouncedSearchTerm, selectedCategory, oficinas])  // Function to check scroll arrows visibility
  const checkScrollArrows = useCallback(() => {
    const container = document.getElementById('categories-container')
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftArrow(scrollLeft > 10) // margem maior para melhor UX
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10) // margem maior para melhor UX
    }
  }, [])

  useEffect(() => {
    const container = document.getElementById('categories-container')
    if (container) {
      // Adicionar event listener para scroll
      container.addEventListener('scroll', checkScrollArrows)
      
      // Verificar estado inicial após renderização
      const timeoutId = setTimeout(checkScrollArrows, 100)
      
      // Observer para detectar mudanças no tamanho do container
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
  }, [checkScrollArrows]) // Remover dependência categories para evitar erro
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }
  
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory(null)  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 gradient-mesh">
          <div className="text-center space-y-8">
            {/* Enhanced Loading Screen with Modern Design */}
            <div className="relative w-40 h-40 mx-auto">
              {/* Outer glowing ring */}
              <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 rounded-full loading-rotate opacity-80"></div>
              <div className="absolute inset-1 bg-white rounded-full"></div>
              
              {/* Middle animated ring */}
              <div className="absolute inset-3 border-4 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 rounded-full loading-rotate opacity-60" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
              <div className="absolute inset-4 bg-white rounded-full"></div>
              
              {/* Inner pulsing ring */}
              <div className="absolute inset-6 border-4 border-blue-400 rounded-full loading-pulse"></div>
              
              {/* Center animated icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Wrench className="w-8 h-8 text-blue-600 loading-bounce" />
              </div>
            </div>
            
            {/* Enhanced loading text with better typography */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Encontrando as melhores oficinas
              </h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Conectando você com oficinas especializadas na sua região
              </p>
              
              {/* Animated dots */}
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full loading-bounce"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full loading-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full loading-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="w-64 mx-auto">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full shimmer"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />      </div>
    )
  }

  // Optimized categories data for mobile performance
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
    { id: "pneus", name: "Pneus", icon: "/balanceamento.png" },    { id: "injecao", name: "Injeção", icon: "/injecao.png" }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Hero Content */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Encontre a sua
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Oficina perfeita...
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Compare preços, avaliações e encontre especialistas próximos a você
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-2xl">
              <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-6 py-4 border border-white/20 hover:shadow-3xl transition-all duration-300 group">
                <Search className="text-blue-500 h-6 w-6 mr-4 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Digite o nome da oficina ou localização..."
                  className="flex-1 border-none outline-none shadow-none bg-transparent p-0 text-lg placeholder:text-gray-400 focus:placeholder:text-gray-300 text-gray-700"
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ boxShadow: 'none' }}
                />
                {searchTerm ? (
                  <button
                    className="text-gray-400 hover:text-gray-600 ml-3 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 flex-shrink-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="text-gray-300 ml-3 flex-shrink-0">
                    <Search className="h-5 w-5" />
                  </div>
                )}
              </div>
              {/* Search suggestions indicator */}
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-4 animate-fade-in-up z-10">                  <p className="text-sm text-gray-600 text-center">
                    Pesquisando por &ldquo;<span className="font-semibold text-blue-600">{searchTerm}</span>&rdquo;...
                  </p>
                </div>
              )}
            </div>
          </div>        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="py-8">
            {/* Enhanced Category Carousel Section */}
            <div className="mb-6 relative">              {/* Category Carousel with Navigation Arrows */}
              <div className="relative">
                
                {/* Left Arrow - Enhanced */}
                {showLeftArrow && (
                  <button
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:shadow-2xl hover:scale-110 group carousel-arrow arrow-left"                    onClick={() => {
                      const container = document.getElementById('categories-container');
                      if (container) {
                        const scrollAmount = Math.min(300, container.clientWidth * 0.8);
                        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                        setTimeout(checkScrollArrows, 100);
                      }
                    }}
                    aria-label="Categorias anteriores"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>                  </button>
                )}

                {/* Right Arrow - Enhanced */}
                {showRightArrow && (                  <button
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:shadow-2xl hover:scale-110 group carousel-arrow arrow-right"
                    onClick={() => {
                      const container = document.getElementById('categories-container');
                      if (container) {
                        const scrollAmount = Math.min(300, container.clientWidth * 0.8);
                        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                        setTimeout(checkScrollArrows, 100);
                      }
                    }}
                    aria-label="Próximas categorias"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>                  </button>
                )}

                {/* Categories Container - Enhanced */}
                <div
                  id="categories-container"
                  className="flex items-center overflow-x-auto py-4 scrollbar-hide gap-2 sm:gap-3 pb-4 mx-12 scroll-smooth categories-container"                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {categories.map((category, index) => (
                    <div
                      key={category.id}
                      className={`
                        flex flex-col items-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-[70px] cursor-pointer transition-all duration-300 hover:scale-105 
                        transform-gpu category-card group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl
                        touch-optimized performance-optimized mobile-text scroll-snap-center
                        ${selectedCategory === category.id ? "text-blue-600 scale-105" : "text-gray-600 hover:text-blue-500"}
                      `}
                      onClick={() => handleCategorySelect(category.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleCategorySelect(category.id)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedCategory === category.id}
                      aria-label={`Filtrar por ${category.name}`}                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      
                      <div
                        className={`
                          relative p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm
                          ${selectedCategory === category.id 
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-300 shadow-blue-200/50 text-white" 
                            : "bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-blue-100/50"
                          }
                          group-hover:rotate-1 transform-gpu overflow-hidden
                        `}
                      >
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        </div>
                        
                        {/* Icon */}
                        <div className="relative z-10">
                          <Image
                            src={category.icon || "/placeholder.svg"}
                            alt={category.name}
                            width={20}
                            height={20}
                            className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${
                              selectedCategory === category.id 
                                ? "brightness-0 invert" 
                                : "group-hover:scale-110"
                            }`}
                          />
                        </div>
                        
                        {/* Selection indicator */}
                        {selectedCategory === category.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                          </div>
                        )}
                        
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>                      </div>
                      
                      <span className={`
                        text-xs sm:text-sm text-center whitespace-nowrap font-medium transition-all duration-300 relative max-w-[60px] sm:max-w-[70px] overflow-hidden text-ellipsis
                        ${selectedCategory === category.id ? "font-bold" : "group-hover:font-semibold"}
                      `}>
                        {category.name}
                        {selectedCategory === category.id && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1"></div>
                        )}
                      </span>                    </div>
                  ))}
                </div>
                
                {/* Scroll indicators for mobile */}
                <div className="absolute left-8 top-1/2 transform -translate-y-1/2 pointer-events-none sm:hidden">
                  <div className="w-8 h-full bg-gradient-to-r from-gray-50 to-transparent"></div>
                </div>
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none sm:hidden">
                  <div className="w-8 h-full bg-gradient-to-l from-gray-50 to-transparent"></div>
                </div>
              </div>

              {/* Filter indicator below carousel */}
              {selectedCategory && (
                <div className="flex items-center justify-center mt-4">
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                    <span className="text-blue-700 text-sm font-medium">
                      Filtrando por: {categories.find((c) => c.id === selectedCategory)?.name}
                    </span>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1 transition-colors"
                      aria-label="Remover filtro"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {(searchTerm || selectedCategory) && (
              <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  {selectedCategory && (
                    <Badge variant="outline" className="flex items-center gap-2 bg-white border-blue-200 text-blue-700 px-2 py-1 text-xs">
                      {categories.find((c) => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory(null)} aria-label="Remover filtro de categoria">
                        <X className="h-3 w-3 ml-1 hover:text-blue-900" />
                      </button>
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="outline" className="flex items-center gap-2 bg-white border-blue-200 text-blue-700 px-2 py-1 text-xs">
                      Busca: {searchTerm}
                      <button onClick={() => setSearchTerm("")}>
                        <X className="h-3 w-3 ml-1 hover:text-blue-900" />
                      </button>
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-800 hover:bg-white text-sm">
                  Limpar filtros
                </Button>
              </div>            )}
          </div>
        </div>
      </div>

      {/* Enhanced Floating Map Toggle Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => setShowMap(!showMap)}
          className={`
            w-16 h-16 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95
            ${showMap 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }
            text-white border-4 border-white hover:shadow-3xl backdrop-blur-sm
            group relative overflow-hidden
          `}
        >
          {/* Ripple effect background */}
          <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
          
          {/* Icon with animation */}
          <div className="relative z-10 transition-transform duration-300 group-hover:rotate-12">
            {showMap ? (
              <List className="h-8 w-8" />
            ) : (
              <MapPin className="h-8 w-8" />
            )}
          </div>
          
          {/* Floating indicator dots */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap backdrop-blur-sm">
            {showMap ? 'Ver lista' : 'Ver mapa'}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>          </div>
        </Button>
      </div>
      
      {!showMap ? (
        <>
          {/* Office Cards Section - Melhorado */}
          <main className="flex-1 bg-gradient-to-br from-gray-50 to-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Results Header */}
              {filteredOficinas.length > 0 && (
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {filteredOficinas.length} oficinas encontradas
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory 
                      ? "Resultados filtrados conforme sua pesquisa" 
                      : "Todas as oficinas disponíveis na sua região"
                    }
                  </p>
                </div>
              )}

              {/* Office Cards Grid */}
              {filteredOficinas.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredOficinas.map((oficina, index) => (
                    <div 
                      key={oficina.id} 
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
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
                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Nenhuma oficina encontrada</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Tente ajustar os filtros ou remover alguns termos de busca para encontrar mais resultados.
                    </p>
                    <Button 
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </>
      ) : (
        <main className="flex-1 container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen relative">
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
            height="600px"
          />
        </main>
      )}
      
      <Footer />
    </div>
  )
}
