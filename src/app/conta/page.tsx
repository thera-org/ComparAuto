'use client'

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
  Store,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppNotifications } from '@/hooks/useAppNotifications'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/user'

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
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    avatar_url: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [minhasOficinas, setMinhasOficinas] = useState<Oficina[]>([])
  const [loadingOficinas, setLoadingOficinas] = useState(false)
  const { crud, upload, system } = useAppNotifications()

  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        console.error('Erro ao obter usuário autenticado:', error)
        setUser(null)
        setLoading(false)
        return
      }

      console.log('Usuário autenticado:', user.id)

      // Tentar buscar dados adicionais do usuário na tabela usuarios
      const { data: userDoc, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error("Erro ao buscar dados do usuário na tabela 'usuarios':", userError)
        // Se a tabela não existe ou não tem permissão, usar apenas dados do auth
        const authUser: UserProfile = {
          ...user,
          email: user.email || '',
          nome: user.user_metadata?.nome || user.user_metadata?.name || '',
          telefone: user.user_metadata?.telefone || '',
          endereco: user.user_metadata?.endereco || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        }
        setUser(authUser)
        setForm({
          nome: authUser.nome || '',
          email: authUser.email,
          telefone: authUser.telefone || '',
          endereco: authUser.endereco || '',
          avatar_url: authUser.avatar_url || '',
        })
      } else {
        // Mesclar dados do auth com dados da tabela usuarios
        const merged = {
          ...user,
          ...userDoc,
          // Priorizar avatar_url do userDoc, senão do user_metadata
          avatar_url:
            userDoc.avatar_url ||
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            '',
        }
        setUser(merged)
        setForm({
          nome: merged.nome || '',
          email: merged.email || '',
          telefone: merged.telefone || '',
          endereco: merged.endereco || '',
          avatar_url: merged.avatar_url || '',
        })
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMinhasOficinas = useCallback(async () => {
    if (!user?.id) return

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
  }, [user])

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
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Ativo
          </Badge>
        )
      case 'pendente':
        return (
          <Badge className="bg-yellow-500">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        )
      case 'inativo':
        return (
          <Badge className="bg-red-500">
            <XCircle className="mr-1 h-3 w-3" />
            Inativo
          </Badge>
        )
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
          .from('avatars')
          .upload(`public/${user.id}`, avatarFile, { upsert: true })
        if (!error && data) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path)
          avatar_url = urlData.publicUrl
          upload.uploadSuccess('Avatar')
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
            avatar_url,
          },
        })

        if (metadataError) {
          console.error('Erro ao atualizar metadados:', metadataError)
          crud.updateError('perfil', metadataError.message)
          return
        }

        // Tentar atualizar tabela usuarios (pode falhar se não existir)
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({
            nome: form.nome,
            telefone: form.telefone,
            endereco: form.endereco,
            avatar_url,
          })
          .eq('id', user.id)

        if (updateError) {
          console.warn("Aviso ao atualizar tabela 'usuarios':", updateError.message)
          // Não retornar erro aqui, pois os dados foram salvos nos metadados
        }

        // Atualiza email se mudou
        if (form.email !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({ email: form.email })
          if (emailError) {
            crud.updateError('email', emailError.message)
            return
          }
        }

        crud.updateSuccess('Perfil')
      }

      setEdit(false)
      fetchUser()
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      system.serverError()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Carregando dados do usuário...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <p className="text-lg text-red-600">Erro ao carregar usuário. Faça login novamente.</p>
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
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt="Avatar"
                  width={120}
                  height={120}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-xl"
                  onError={e => {
                    e.currentTarget.src = '/placeholder.svg'
                  }}
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-xl">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-4 border-white bg-green-500"></div>
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-bold">{user.nome || 'Usuário'}</h1>
              <p className="flex items-center gap-2 text-lg text-blue-100">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              {user.telefone && (
                <p className="mt-1 flex items-center gap-2 text-blue-100">
                  <Phone className="h-4 w-4" />
                  {user.telefone}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-2 border-b-2 px-2 py-4 font-medium transition-colors ${
                activeTab === 'perfil'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <User className="h-5 w-5" />
              Meu Perfil
            </button>
            <button
              onClick={() => setActiveTab('oficinas')}
              className={`flex items-center gap-2 border-b-2 px-2 py-4 font-medium transition-colors ${
                activeTab === 'oficinas'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
              className={`flex items-center gap-2 border-b-2 px-2 py-4 font-medium transition-colors ${
                activeTab === 'configuracoes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Settings className="h-5 w-5" />
              Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {activeTab === 'perfil' && (
          <div className="overflow-hidden rounded-xl bg-white shadow-md">
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Informações do Perfil</h2>
                  <p className="mt-1 text-gray-600">Gerencie suas informações pessoais</p>
                </div>
                {!edit && (
                  <Button onClick={() => setEdit(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Perfil
                  </Button>
                )}
              </div>

              {edit ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-6 rounded-xl bg-gray-50 p-6">
                    <div className="relative">
                      {form.avatar_url ? (
                        <Image
                          src={form.avatar_url}
                          alt="Avatar"
                          width={96}
                          height={96}
                          className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                          onError={e => {
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 shadow-lg">
                          <User className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-600 p-2 shadow-lg transition-colors hover:bg-blue-700">
                        <Camera className="h-4 w-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Foto do Perfil</h3>
                      <p className="mt-1 text-sm text-gray-600">PNG, JPG ou GIF. Max 2MB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <User className="mr-2 inline h-4 w-4" />
                        Nome Completo *
                      </label>
                      <input
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <Mail className="mr-2 inline h-4 w-4" />
                        E-mail *
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <Phone className="mr-2 inline h-4 w-4" />
                        Telefone
                      </label>
                      <input
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <MapPin className="mr-2 inline h-4 w-4" />
                        Endereço
                      </label>
                      <input
                        name="endereco"
                        value={form.endereco}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="Rua, Número, Cidade - Estado"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 border-t pt-6">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 py-3 hover:bg-blue-700"
                    >
                      {saving ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
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
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                      <User className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {user.nome || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                      <Mail className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">E-mail</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                      <Phone className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Telefone</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {user.telefone || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                      <MapPin className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Endereço</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {user.endereco || 'Não informado'}
                        </p>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Minhas Oficinas</h2>
                <p className="mt-1 text-gray-600">Gerencie suas oficinas cadastradas</p>
              </div>
              <Button
                onClick={() => router.push('/cadastro-oficina')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Store className="mr-2 h-4 w-4" />
                Cadastrar Nova Oficina
              </Button>
            </div>

            {loadingOficinas ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Carregando oficinas...</p>
              </div>
            ) : minhasOficinas.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {minhasOficinas.map(oficina => (
                  <div
                    key={oficina.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-xl font-bold text-gray-900">{oficina.nome}</h3>
                        {getStatusBadge(oficina.status)}
                      </div>

                      {oficina.endereco && (
                        <p className="mb-3 flex items-start gap-2 text-gray-600">
                          <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{oficina.endereco}</span>
                        </p>
                      )}

                      {oficina.telefone && (
                        <p className="mb-3 flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{oficina.telefone}</span>
                        </p>
                      )}

                      {oficina.servicos_oferecidos && oficina.servicos_oferecidos.length > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-sm font-medium text-gray-700">Serviços:</p>
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

                      <div className="mt-4 flex gap-2">
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
                            <Edit className="mr-1 h-3 w-3" />
                            Editar
                          </Button>
                        )}
                      </div>

                      {oficina.status === 'pendente' && (
                        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                          <p className="text-xs text-yellow-800">
                            <Clock className="mr-1 inline h-3 w-3" />
                            Aguardando aprovação do administrador
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-white py-16 text-center shadow-md">
                <Store className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Nenhuma oficina cadastrada
                </h3>
                <p className="mb-6 text-gray-600">Comece cadastrando sua primeira oficina</p>
                <Button
                  onClick={() => router.push('/cadastro-oficina')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Store className="mr-2 h-4 w-4" />
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
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Configurações</h2>
              <p className="text-gray-600">Gerencie suas preferências e conta</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
                <Bell className="mb-4 h-8 w-8 text-blue-600" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Notificações</h3>
                <p className="mb-4 text-gray-600">Gerencie como você recebe notificações</p>
                <Button variant="outline" className="w-full">
                  Configurar
                </Button>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
                <Shield className="mb-4 h-8 w-8 text-green-600" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Privacidade e Segurança
                </h3>
                <p className="mb-4 text-gray-600">Controle suas configurações de privacidade</p>
                <Button variant="outline" className="w-full">
                  Gerenciar
                </Button>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
                <Settings className="mb-4 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Alterar Senha</h3>
                <p className="mb-4 text-gray-600">Atualize sua senha de acesso</p>
                <Button variant="outline" className="w-full">
                  Alterar
                </Button>
              </div>

              <div className="rounded-xl border-2 border-red-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
                <XCircle className="mb-4 h-8 w-8 text-red-600" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Excluir Conta</h3>
                <p className="mb-4 text-gray-600">Remover permanentemente sua conta</p>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
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
