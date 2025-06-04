"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Heart, Star, List, Search, X } from "lucide-react"
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
      const { data, error } = await supabase
        .from("oficinas")
        .select("id, nome, endereco, latitude, longitude, foto_url, telefone, status, category")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
      
      if (error) {
        console.error("Erro ao buscar oficinas:", error)
        setOficinas([])
      } else {
        setOficinas((data as Oficina[]) || [])
      }
      setLoading(false)
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
  }, [debouncedSearchTerm, selectedCategory, oficinas])

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Dados das categorias para mapeamento
  const categories = [
    { id: "troca-oleo", name: "Troca de óleo", icon: "/oleo.png" },
    { id: "avaliacao", name: "Avaliação do carro", icon: "/avaliacao.png" },
    { id: "pelicula", name: "Aplicação de película", icon: "/pelicula.png" },
    { id: "filtros", name: "Troca de filtros", icon: "/filtro.png" },
    { id: "alinhamento", name: "Alinhamento", icon: "/balanceamento.png" },
    { id: "pastilhas", name: "Troca de pastilhas", icon: "/freio.png" },
    { id: "polimento", name: "Polimento", icon: "/polimento.png" },
    { id: "acessorios", name: "Instalação de acessórios", icon: "/acessorios.png" },
    { id: "ar-condicionado", name: "Ar-condicionado", icon: "/ar-condicionado.png" },
    { id: "higienizacao", name: "Higienização", icon: "/higienizacao.png" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="border-b sticky top-[72px] bg-white z-40">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <div className="flex justify-center mb-4">
              <div className="relative w-full max-w-2xl flex items-center bg-white rounded-full shadow-lg px-4 py-2 border border-gray-200">
                <Search className="text-gray-400 h-5 w-5 mr-2" />
                <Input
                  type="text"
                  placeholder="Buscar oficinas, serviços..."
                  className="flex-1 border-none outline-none shadow-none bg-transparent p-0 text-base"
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ boxShadow: 'none' }}
                />
                {searchTerm && (
                  <button
                    className="text-gray-400 hover:text-gray-600 ml-2"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center overflow-x-auto py-2 scrollbar-hide gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex flex-col items-center gap-1 min-w-[56px] cursor-pointer transition-colors ${
                    selectedCategory === category.id ? "text-primary" : "text-gray-600"
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div
                    className={`p-2 rounded-full ${selectedCategory === category.id ? "bg-primary/10" : "bg-gray-100"}`}
                  >
                    <Image
                      src={category.icon || "/placeholder.svg"}
                      alt={category.name}
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </div>
                  <span className="text-xs text-center whitespace-nowrap">{category.name}</span>
                </div>
              ))}
            </div>
            {(searchTerm || selectedCategory) && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {selectedCategory && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {categories.find((c) => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory(null)} aria-label="Remover filtro de categoria">
                        <X className="h-3 w-3 ml-1" />
                      </button>
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Busca: {searchTerm}
                      <button onClick={() => setSearchTerm("")}>
                        <X className="h-3 w-3 ml-1" />
                      </button>
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <main className="flex-1 container mx-auto px-4 py-8">        {!showMap ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredOficinas.map((oficina) => (
              <div key={oficina.id} className="group cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <Image
                    src={oficina.foto_url || "/placeholder.svg"}
                    alt={oficina.nome || "Oficina"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-3 right-3 h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-110 transition-all duration-200"
                  >
                    <Heart className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 leading-tight truncate pr-2">{oficina.nome}</h3>
                    <div className="flex items-center flex-shrink-0">
                      <Star className="h-3.5 w-3.5 fill-current text-gray-900" />
                      <span className="ml-1 text-sm font-medium">Novo</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm truncate">{oficina.endereco}</p>
                  <p className="text-gray-900 font-medium text-sm">
                    Serviços a partir de <span className="font-semibold">R$50</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            onClick={() => setShowMap(!showMap)}
            className="rounded-full bg-gray-900 text-white px-4 py-3 shadow-lg gap-2"
          >
            {showMap ? (
              <>
                <List className="h-4 w-4" />
                Mostrar Lista
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                Mostrar Mapa
              </>
            )}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}