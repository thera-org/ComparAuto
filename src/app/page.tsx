"use client"

import { Search, X, Wrench, Star, Shield, Clock, Award, Filter, SlidersHorizontal } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

import Footer from "@/components/Footer"
import Header from "@/components/Header"
import OfficeCard from "@/components/OfficeCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

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
  foto_url?: string
  telefone?: string
  status?: string
  servicos_oferecidos?: string[]
  cidade?: string
  estado?: string
}

export default function Home() {
  const [, setUserData] = useState<UserData | null>(null)
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredOficinas, setFilteredOficinas] = useState<Oficina[]>([])
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

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
            .from("usuarios")
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
          .eq("status", "ativo")
        
        if (error) {
          console.error("Erro detalhado ao buscar oficinas:", error)
          setOficinas([])
        } else {
          console.log("Dados brutos encontrados:", data)
          const oficinasAtivas = (data as Oficina[]) || []
          console.log("Oficinas ativas encontradas:", oficinasAtivas.length)
          console.log("Oficinas com serviços:", oficinasAtivas.map(o => ({ 
            nome: o.nome, 
            servicos: o.servicos_oferecidos 
          })))
          setOficinas(oficinasAtivas)
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
      // Mapear o ID da categoria para o nome do serviço
      const categoryMap: Record<string, string> = {
        "troca-oleo": "Troca de óleo",
        "avaliacao": "Avaliação",
        "pelicula": "Película",
        "filtros": "Filtros",
        "alinhamento": "Alinhamento e balanceamento",
        "pastilhas": "Pastilhas",
        "polimento": "Polimento",
        "acessorios": "Acessórios",
        "ar-condicionado": "Ar-condicionado",
        "higienizacao": "Higienização",
        "mecanica-geral": "Mecânica geral",
        "eletrica": "Elétrica",
        "freios": "Freios",
        "suspensao": "Suspensão",
        "escape": "Sistema de escape",
        "bateria": "Bateria",
        "pneus": "Pneus",
        "injecao": "Injeção eletrônica"
      }
      
      const servicoNome = categoryMap[selectedCategory]
      if (servicoNome) {
        filtered = filtered.filter((oficina) => 
          oficina.servicos_oferecidos?.includes(servicoNome)
        )
      }
    }
    setFilteredOficinas(filtered)
  }, [debouncedSearchTerm, selectedCategory, oficinas])

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Hero Section - Modern Marketplace Style */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Encontre a oficina
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                perfeita para seu carro
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light">
              Marketplace de oficinas automotivas. Compare serviços, preços e avaliações em um só lugar.
            </p>
            
            {/* Search Bar - Modern Marketplace Design */}
            <div className="max-w-3xl mx-auto mb-16">
              <div className="relative group">
                <div className="flex items-center bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 overflow-hidden">
                  <div className="flex-1 flex items-center px-8 py-5">
                    <Search className="text-gray-400 h-6 w-6 mr-4 flex-shrink-0" />
                    <Input
                      type="text"
                      placeholder="Busque por serviço, oficina ou cidade..."
                      className="flex-1 border-none outline-none shadow-none bg-transparent p-0 text-lg placeholder:text-gray-400"
                      value={searchTerm}
                      onChange={handleSearch}
                      style={{ boxShadow: 'none' }}
                    />
                    {searchTerm && (
                      <button
                        className="text-gray-400 hover:text-gray-600 ml-4 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                        onClick={() => setSearchTerm("")}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <Button className="m-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-xl font-semibold text-lg shadow-lg">
                    Buscar
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Section - Modern Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4 mx-auto shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{oficinas.length}+</div>
                <div className="text-sm text-gray-600 font-medium">Oficinas Ativas</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-4 mx-auto shadow-lg">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">4.8★</div>
                <div className="text-sm text-gray-600 font-medium">Avaliação Média</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-4 mx-auto shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">24h</div>
                <div className="text-sm text-gray-600 font-medium">Suporte</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl mb-4 mx-auto shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
                <div className="text-sm text-gray-600 font-medium">Segurança</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Serviços Disponíveis</h2>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
          </div>
          
          <div className="relative">
            {/* Categories container */}
            <div 
              id="categories-container"
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`
                    flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 group
                    ${selectedCategory === category.id 
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl scale-105" 
                      : "bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-xl border border-gray-200 hover:border-blue-300"
                    }
                  `}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div
                    className={`
                      relative p-3 rounded-xl transition-all duration-300
                      ${selectedCategory === category.id 
                        ? "bg-white/20" 
                        : "bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-purple-50"
                      }
                    `}
                  >
                    <Image
                      src={category.icon || "/placeholder.svg"}
                      alt={category.name}
                      width={32}
                      height={32}
                      className={`h-8 w-8 transition-all duration-300 ${
                        selectedCategory === category.id 
                          ? "brightness-0 invert" 
                          : "group-hover:scale-110"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-center font-semibold leading-tight">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active filters */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              {selectedCategory && (
                <Badge className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
                  <Filter className="h-3 w-3" />
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 text-sm font-medium shadow-lg">
                  <Search className="h-3 w-3" />
                  {searchTerm}
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
              >
                Limpar todos
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results header */}
            {filteredOficinas.length > 0 && (
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {filteredOficinas.length} {filteredOficinas.length === 1 ? 'oficina encontrada' : 'oficinas encontradas'}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {selectedCategory ? `Especialistas em ${categories.find(c => c.id === selectedCategory)?.name}` : 'Todas as oficinas disponíveis para você'}
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Ordenar
                </Button>
              </div>
            )}

            {/* Office Cards Grid */}
            {filteredOficinas.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOficinas.map((oficina, index) => (
                  <div 
                    key={oficina.id} 
                    className="animate-fade-in-up transform hover:scale-[1.02] transition-all duration-300"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <OfficeCard oficina={oficina} />
                  </div>
                ))}
              </div>
            )}

            {/* No results state */}
            {filteredOficinas.length === 0 && (
              <div className="text-center py-32">
                <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
                  <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Nenhuma oficina encontrada</h3>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Não encontramos oficinas que correspondam aos seus critérios de busca. Tente ajustar os filtros ou explorar outras categorias.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold shadow-lg"
                    >
                      Limpar filtros
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="px-10 py-4 text-lg font-semibold"
                    >
                      Ver todas
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      
      <Footer />
    </div>
  )
}
