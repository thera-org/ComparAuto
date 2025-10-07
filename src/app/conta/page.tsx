"use client"

import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { UserProfile } from "@/types/user"
import { useAppNotifications } from "@/hooks/useAppNotifications"
import { 
  User, 
  Building2, 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  Edit, 
  Save, 
  X,
  Phone,
  Mail,
  MapPin,
  Camera,
  CheckCircle,
  Clock,
  XCircle,
  Store
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


interface Oficina {
  id: string
  nome: string
  status: string
  endereco?: string
  telefone?: string
  servicos_oferecidos?: string[]
}

export default function ContaPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'perfil' | 'oficinas' | 'configuracoes'>('perfil')
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    avatar_url: ""
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [minhasOficinas, setMinhasOficinas] = useState<Oficina[]>([])
  const [loadingOficinas, setLoadingOficinas] = useState(false)
  const { crud, upload, system } = useAppNotifications()

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        console.error("Erro ao obter usuário autenticado:", error)
        setUser(null)
        setLoading(false)
        return
      }

      console.log("Usuário autenticado:", user.id)
      
      // Tentar buscar dados adicionais do usuário na tabela usuarios
      const { data: userDoc, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (userError) {
        console.error("Erro ao buscar dados do usuário na tabela 'usuarios':", userError)
        // Se a tabela não existe ou não tem permissão, usar apenas dados do auth
        const authUser: UserProfile = {
          ...user,
          email: user.email || "",
          nome: user.user_metadata?.nome || user.user_metadata?.name || "",
          telefone: user.user_metadata?.telefone || "",
          endereco: user.user_metadata?.endereco || "",
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || ""
        }
        setUser(authUser)
        setForm({
          nome: authUser.nome || "",
          email: authUser.email,
          telefone: authUser.telefone || "",
          endereco: authUser.endereco || "",
          avatar_url: authUser.avatar_url || ""
        })
      } else {
        // Mesclar dados do auth com dados da tabela usuarios
        const merged = { 
          ...user, 
          ...userDoc,
          // Priorizar avatar_url do userDoc, senão do user_metadata
          avatar_url: userDoc.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || ""
        }
        setUser(merged)
        setForm({
          nome: merged.nome || "",
          email: merged.email || "",
          telefone: merged.telefone || "",
          endereco: merged.endereco || "",
          avatar_url: merged.avatar_url || ""
        })
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMinhasOficinas = useCallback(async () => {
    if (!user) return
    
    setLoadingOficinas(true)
    try {
      console.log('Buscando oficinas do usuário:', user.id)
      
      const { data, error } = await supabase
        .from('oficinas')
        .select('id, nome, status, endereco, telefone, servicos_oferecidos')
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Erro ao buscar oficinas:', error)
        throw error
      }
      
      console.log('Oficinas encontradas:', data?.length || 0, 'oficina(s)')
      setMinhasOficinas(data || [])
    } catch (err) {
      console.error('Erro ao carregar oficinas:', err)
    } finally {
      setLoadingOficinas(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (activeTab === 'oficinas' && user?.id) {
      fetchMinhasOficinas()
    }
  }, [activeTab, user?.id, fetchMinhasOficinas])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      setForm({ ...form, avatar_url: URL.createObjectURL(e.target.files[0]) })
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>
      case 'pendente':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'inativo':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Inativo</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    let avatar_url = form.avatar_url

    try {
      // Upload avatar se mudou
      if (avatarFile && user) {
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(`public/${user.id}`, avatarFile, { upsert: true })
        if (!error && data) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(data.path)
          avatar_url = urlData.publicUrl
          upload.uploadSuccess("Avatar")
        } else if (error) {
          upload.uploadError(error.message)
          return
        }
      }

      // Atualiza tabela users
      if (user) {
        // Primeiro, tenta atualizar os metadados do usuário (sempre funciona)
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            nome: form.nome,
            telefone: form.telefone,
            endereco: form.endereco,
            avatar_url
          }
        })

        if (metadataError) {
          console.error("Erro ao atualizar metadados:", metadataError)
          crud.updateError("perfil", metadataError.message)
          return
        }

        // Tentar atualizar tabela usuarios (pode falhar se não existir)
        const { error: updateError } = await supabase
          .from("usuarios")
          .update({
            nome: form.nome,
            telefone: form.telefone,
            endereco: form.endereco,
            avatar_url
          })
          .eq("id", user.id)

        if (updateError) {
          console.warn("Aviso ao atualizar tabela 'usuarios':", updateError.message)
          // Não retornar erro aqui, pois os dados foram salvos nos metadados
        }

        // Atualiza email se mudou
        if (form.email !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({ email: form.email })
          if (emailError) {
            crud.updateError("email", emailError.message)
            return
          }
        }

        crud.updateSuccess("Perfil")
      }

      setEdit(false)
      fetchUser()
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err)
      system.serverError()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do usuário...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">Erro ao carregar usuário. Faça login novamente.</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header com informações do usuário */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-6">
            <div className="relative">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt="Avatar"
                  width={120}
                  height={120}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white shadow-xl flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{user.nome || 'Usuário'}</h1>
              <p className="text-blue-100 text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              {user.telefone && (
                <p className="text-blue-100 flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  {user.telefone}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'perfil'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="h-5 w-5" />
              Meu Perfil
            </button>
            <button
              onClick={() => setActiveTab('oficinas')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'oficinas'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="h-5 w-5" />
              Minhas Oficinas
              {minhasOficinas.length > 0 && (
                <Badge className="bg-blue-600">{minhasOficinas.length}</Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'configuracoes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-5 w-5" />
              Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'perfil' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Informações do Perfil</h2>
                  <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
                </div>
                {!edit && (
                  <Button onClick={() => setEdit(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>

       {edit ? (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
      <div className="relative">
        {form.avatar_url ? (
          <Image
            src={form.avatar_url}
            alt="Avatar"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
            <User className="h-10 w-10 text-gray-400" />
          </div>
        )}
        <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
          <Camera className="h-4 w-4 text-white" />
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </label>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">Foto do Perfil</h3>
        <p className="text-sm text-gray-600 mt-1">PNG, JPG ou GIF. Max 2MB</p>
      </div>
    </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Nome Completo *
                </label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  E-mail *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Telefone
                </label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Endereço
                </label>
                <input
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Rua, Número, Cidade - Estado"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEdit(false)}
                disabled={saving}
                className="px-8"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user.nome || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">E-mail</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user.telefone || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user.endereco || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
            </div>
          </div>
        )}

        {/* Tab de Oficinas */}
        {activeTab === 'oficinas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Minhas Oficinas</h2>
                <p className="text-gray-600 mt-1">Gerencie suas oficinas cadastradas</p>
              </div>
              <Button 
                onClick={() => router.push('/cadastro-oficina')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Store className="h-4 w-4 mr-2" />
                Cadastrar Nova Oficina
              </Button>
            </div>

            {loadingOficinas ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando oficinas...</p>
              </div>
            ) : minhasOficinas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {minhasOficinas.map((oficina) => (
                  <div key={oficina.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{oficina.nome}</h3>
                        {getStatusBadge(oficina.status)}
                      </div>
                      
                      {oficina.endereco && (
                        <p className="text-gray-600 flex items-start gap-2 mb-3">
                          <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span className="text-sm">{oficina.endereco}</span>
                        </p>
                      )}
                      
                      {oficina.telefone && (
                        <p className="text-gray-600 flex items-center gap-2 mb-3">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{oficina.telefone}</span>
                        </p>
                      )}
                      
                      {oficina.servicos_oferecidos && oficina.servicos_oferecidos.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Serviços:</p>
                          <div className="flex flex-wrap gap-2">
                            {oficina.servicos_oferecidos.slice(0, 3).map((servico, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {servico}
                              </Badge>
                            ))}
                            {oficina.servicos_oferecidos.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{oficina.servicos_oferecidos.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/oficina/${oficina.id}`)}
                          className="flex-1"
                        >
                          Ver Detalhes
                        </Button>
                        {oficina.status === 'ativo' && (
                          <Button 
                            size="sm"
                            onClick={() => router.push(`/admin/oficinas/editar/${oficina.id}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        )}
                      </div>
                      
                      {oficina.status === 'pendente' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Aguardando aprovação do administrador
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma oficina cadastrada</h3>
                <p className="text-gray-600 mb-6">Comece cadastrando sua primeira oficina</p>
                <Button 
                  onClick={() => router.push('/cadastro-oficina')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Cadastrar Oficina
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab de Configurações */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações</h2>
              <p className="text-gray-600">Gerencie suas preferências e conta</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                <Bell className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notificações</h3>
                <p className="text-gray-600 mb-4">Gerencie como você recebe notificações</p>
                <Button variant="outline" className="w-full">
                  Configurar
                </Button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                <Shield className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacidade e Segurança</h3>
                <p className="text-gray-600 mb-4">Controle suas configurações de privacidade</p>
                <Button variant="outline" className="w-full">
                  Gerenciar
                </Button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                <Settings className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Alterar Senha</h3>
                <p className="text-gray-600 mb-4">Atualize sua senha de acesso</p>
                <Button variant="outline" className="w-full">
                  Alterar
                </Button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2 border-red-200">
                <XCircle className="h-8 w-8 text-red-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Conta</h3>
                <p className="text-gray-600 mb-4">Remover permanentemente sua conta</p>
                <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}