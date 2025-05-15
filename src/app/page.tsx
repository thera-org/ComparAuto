"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Heart, Star, List } from "lucide-react"
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"

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
}


export default function Home() {
  const [, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [workshops, setWorkshops] = useState<Workshop[]>([])

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }



  // Dados das categorias para mapeamento
  const categories = [
    { name: "Troca de óleo", icon: "/oleo.png" },
    { name: "Avaliação do carro", icon: "/avaliacao.png" },
    { name: "Aplicação de película", icon: "/pelicula.png" },
    { name: "Troca de filtros", icon: "/filtro.png" },
    { name: "Alinhamento e balanceamento", icon: "/balanceamento.png" },
    { name: "Troca de pastilhas", icon: "/freio.png" },
    { name: "Polimento e cristalização", icon: "/polimento.png" },
    { name: "Instalação de acessórios", icon: "/acessorios.png" },
    { name: "Manutenção do ar-condicionado", icon: "/ar-condicionado.png" },
    { name: "Higienização interna", icon: "/higienizacao.png" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="border-b sticky top-[72px] bg-white z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center overflow-x-auto py-4 scrollbar-hide gap-8">
            {categories.map((category, index) => (
              <div key={index} className="flex flex-col items-center gap-2 min-w-[56px]">
                <Image 
                  src={category.icon} 
                  alt={category.name}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
                <span className="text-xs text-center">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        {!showMap ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="space-y-2">
                <div className="relative aspect-square rounded-xl overflow-hidden">
                  <Image
                    src="/placeholder.svg"
                    alt={workshop.name}
                    fill
                    className="object-cover"
                  />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white hover:text-rose-500">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex justify-between">
                  <h3 className="font-medium">{workshop.name}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1">{workshop.rating}</span>
                  </div>
                </div>
                <p className="text-gray-500">{workshop.address}</p>
                <p>
                  <span className="font-medium">{workshop.price}</span>
                </p>
              </div>
            ))}
          </div>
        ) : isLoaded ? (
          <GoogleMap
          zoom={13}
          center={{ lat: -2.53073, lng:  -44.3068 }}
          mapContainerStyle={{ width: '100%', height: '500px' }}
        >
          <Marker position={{ lat: -23.5505, lng: -46.6333 }} />
          </GoogleMap>
        ) : (
          <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
            <p>Carregando mapa...</p>
          </div>
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