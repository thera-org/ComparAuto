"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Heart, Star, List, Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import WorkshopMap from "@/components/WorkshopMap"

interface UserData {
  nome?: string
  email?: string
  role?: string
  photoURL?: string
}

interface Workshop {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  rating: number
  price: string
  nome?: string
  endereco?: string
  latitude?: number
  longitude?: number
  foto_url?: string
  telefone?: string
  email?: string
  descricao?: string
}

// Definir tipo local para WorkshopMap para evitar erro de importação de tipo
interface WorkshopMapType {
  id: string
  nome: string
  endereco: string
  latitude: number
  longitude: number
  foto_url?: string
  telefone?: string
  email?: string
  descricao?: string
}

function toMapWorkshop(w: Workshop): WorkshopMapType {
  return {
    id: String(w.id),
    nome: w.name || w.nome || "",
    endereco: w.address || w.endereco || "",
    latitude: w.lat ?? w.latitude ?? 0,
    longitude: w.lng ?? w.longitude ?? 0,
    foto_url: w.foto_url,
    telefone: w.telefone,
    email: w.email,
    descricao: w.descricao,
  }
}

export default function Home() {
  const [, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([])

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
    // Mock data - substitua por chamada real ao Supabase
    const mockWorkshops: Workshop[] = [
       {
        id: 1,
        name: "Chapadinha Auto Center",
        address: "Jardim das Margaridas, São Luis",
        lat: -23.5635,
        lng: -46.6543,
        rating: 4.8,
        price: "R$120/hora"
      },
      /*{
        id: 2,
        name: "Auto Serviço Premium",
        address: "Rua Augusta, 1500, São Paulo",
        lat: -23.5586,
        lng: -46.6592,
        rating: 4.6,
        price: "R$150/hora"
      }*/
    ]
    setWorkshops(mockWorkshops)
  }, [])

  useEffect(() => {
    // Filtro por busca e categoria
    let filtered = workshops
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (workshop) =>
          (workshop.name?.toLowerCase().includes(term) ||
            workshop.address?.toLowerCase().includes(term) ||
            workshop.descricao?.toLowerCase().includes(term))
      )
    }
    if (selectedCategory) {
      // Simulação de filtro por categoria
      filtered = filtered.filter(() => true)
    }
    setFilteredWorkshops(filtered)
  }, [searchTerm, selectedCategory, workshops])

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
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar oficinas, serviços..."
                  className="pl-9 pr-4"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
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
                      <button onClick={() => setSelectedCategory(null)}>
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
      <main className="flex-1 container mx-auto px-4 py-8">
        {!showMap ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredWorkshops.map((workshop) => (
              <div key={workshop.id} className="space-y-2">
                <div className="relative aspect-square rounded-xl overflow-hidden">
                  <Image
                    src={workshop.foto_url || "/placeholder.svg"}
                    alt={workshop.name ? String(workshop.name) : workshop.nome || "Oficina"}
                    fill
                    className="object-cover"
                  />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white hover:text-rose-500">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex justify-between">
                  <h3 className="font-medium">{workshop.name || workshop.nome}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1">{workshop.rating || "Novo"}</span>
                  </div>
                </div>
                <p className="text-gray-500">{workshop.address || workshop.endereco}</p>
                <p>
                  <span className="font-medium">{workshop.price || "Serviços a partir de R$50"}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <WorkshopMap
            workshops={filteredWorkshops
              .filter((w) => (w.lat ?? w.latitude) && (w.lng ?? w.longitude))
              .map(toMapWorkshop)
            }
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