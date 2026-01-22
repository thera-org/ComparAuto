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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
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

const MENU_ITEMS = [
  { id: 'perfil', label: 'Informações Pessoais', icon: 'person' },
  { id: 'oficinas', label: 'Minhas Oficinas', icon: 'store' },
  { id: 'agendamentos', label: 'Meus Agendamentos', icon: 'calendar_today' },
  { id: 'veiculos', label: 'Meus Veículos', icon: 'directions_car' },
  { id: 'pagamentos', label: 'Pagamentos', icon: 'credit_card' },
  { id: 'seguranca', label: 'Segurança', icon: 'security' },
  { id: 'preferencias', label: 'Preferências', icon: 'settings' },
]

const QUICK_ACTIONS = [
  {
    id: 'dados',
    icon: 'badge',
    title: 'Dados Pessoais',
    desc: 'Atualize suas informações de contato e endereço para facilitar o serviço.',
    action: 'Editar dados',
    tab: 'perfil',
  },
  {
    id: 'historico',
    icon: 'history',
    title: 'Histórico de Serviços',
    desc: 'Veja orçamentos passados e detalhes de manutenções realizadas.',
    action: 'Ver histórico',
    tab: 'agendamentos',
  },
  {
    id: 'veiculos',
    icon: 'directions_car',
    title: 'Meus Veículos',
    desc: 'Gerencie os carros cadastrados para agendamento rápido.',
    action: 'Gerenciar veículos',
    tab: 'veiculos',
  },
  {
    id: 'pagamentos',
    icon: 'payment',
    title: 'Pagamentos e Reembolsos',
    desc: 'Consulte faturas, recibos e status de reembolsos.',
    action: 'Ver pagamentos',
    tab: 'pagamentos',
  },
  {
    id: 'seguranca',
    icon: 'lock',
    title: 'Login e Segurança',
    desc: 'Altere sua senha e configure a autenticação de dois fatores.',
    action: 'Atualizar segurança',
    tab: 'seguranca',
  },
  {
    id: 'ajuda',
    icon: 'help_outline',
    title: 'Central de Ajuda',
    desc: 'Tire dúvidas sobre serviços, pagamentos e suporte técnico.',
    action: 'Obter ajuda',
    href: '/ajuda',
  },
]

export default function ContaPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('perfil')
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
        data: { session },
        error,
      } = await supabase.auth.getSession()
      const user = session?.user
      if (error || !user) {
        console.error('Erro ao obter usuário autenticado:', error)
        setUser(null)
        setLoading(false)
        return
      }

      const { data: userDoc, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
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
        const merged = {
          ...user,
          ...userDoc,
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
      const { data, error } = await supabase
        .from('oficinas')
        .select('id, nome, status, endereco, telefone, servicos_oferecidos')
        .eq('user_id', user.id)

      if (error) throw error
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

      if (user) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            nome: form.nome,
            telefone: form.telefone,
            endereco: form.endereco,
            avatar_url,
          },
        })

        if (metadataError) {
          crud.updateError('perfil', metadataError.message)
          return
        }

        await supabase
          .from('usuarios')
          .update({
            nome: form.nome,
            telefone: form.telefone,
            endereco: form.endereco,
            avatar_url,
          })
          .eq('id', user.id)

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

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0
    let filled = 0
    const total = 4
    if (user.nome) filled++
    if (user.email) filled++
    if (user.telefone) filled++
    if (user.endereco) filled++
    return Math.round((filled / total) * 100)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <div className="flex flex-grow items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-gray-600">Carregando dados do usuário...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <div className="flex flex-grow items-center justify-center">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <p className="text-lg text-red-600">Erro ao carregar usuário. Faça login novamente.</p>
            <Button
              onClick={() => router.push('/login')}
              className="mt-4 bg-primary hover:bg-primary-hover"
            >
              Fazer Login
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 lg:px-8">
        {/* Header Section */}
        <section className="mb-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold">
                Olá, {user.nome?.split(' ')[0] || 'Usuário'}!
              </h1>
              <p className="text-gray-500">Gerencie seus dados e serviços automotivos.</p>
            </div>

            {/* Profile Completion Card */}
            {profileCompletion < 100 && (
              <div className="flex w-full max-w-md items-center gap-4 rounded-xl border border-gray-200 bg-[#F7F7F7] p-4 shadow-subtle">
                <div className="relative h-12 w-12 flex-shrink-0">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-gray-300"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${profileCompletion}, 100`}
                      strokeWidth="3"
                    />
                  </svg>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-xs font-bold text-primary">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Complete seu perfil</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Adicione suas informações para recomendações personalizadas.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('perfil')
                    setEdit(true)
                  }}
                  className="whitespace-nowrap text-sm font-medium text-primary hover:underline"
                >
                  Completar
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="w-full flex-shrink-0 lg:w-64">
            <nav className="space-y-1">
              {MENU_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-gray-100 font-medium text-primary'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="material-icons-outlined text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-8 border-t border-gray-200 px-4 pt-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Quick Actions Grid - Show on perfil tab */}
            {activeTab === 'perfil' && !edit && (
              <>
                <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {QUICK_ACTIONS.map(action => (
                    <div
                      key={action.id}
                      onClick={() =>
                        action.href
                          ? router.push(action.href)
                          : setActiveTab(action.tab || 'perfil')
                      }
                      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-primary">
                        <span className="material-icons-outlined">{action.icon}</span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary">
                        {action.title}
                      </h3>
                      <p className="mb-4 text-sm text-gray-500">{action.desc}</p>
                      <span className="text-sm font-medium underline decoration-gray-300 underline-offset-4 transition-all group-hover:decoration-primary">
                        {action.action}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Personal Info Section */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Informações Pessoais</h2>
                    <button
                      onClick={() => setEdit(true)}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                  </div>

                  <div className="mb-6 flex items-start gap-6">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
                        onError={e => {
                          e.currentTarget.src = '/placeholder.svg'
                        }}
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">{user.nome || 'Nome não informado'}</h3>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="mb-1 text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">{user.telefone || 'Não informado'}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="mb-1 text-sm text-gray-500">Endereço</p>
                      <p className="font-medium">{user.endereco || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Edit Profile Form */}
            {activeTab === 'perfil' && edit && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Editar Informações</h2>
                  <button
                    onClick={() => setEdit(false)}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Upload */}
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
                      <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 shadow-lg transition-colors hover:bg-primary-hover">
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
                      <h3 className="font-semibold">Foto do Perfil</h3>
                      <p className="mt-1 text-sm text-gray-500">PNG, JPG ou GIF. Max 2MB</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Nome Completo *</label>
                      <input
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">E-mail *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Telefone</label>
                      <input
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Endereço</label>
                      <input
                        name="endereco"
                        value={form.endereco}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Rua, Número, Cidade - Estado"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 border-t border-gray-200 pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Salvar Alterações
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEdit(false)}
                      disabled={saving}
                      className="rounded-lg border border-gray-300 px-8 py-3 font-medium transition-colors hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab de Oficinas */}
            {activeTab === 'oficinas' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Minhas Oficinas</h2>
                    <p className="mt-1 text-gray-500">Gerencie suas oficinas cadastradas</p>
                  </div>
                  <button
                    onClick={() => router.push('/cadastro-oficina')}
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    <Store className="h-4 w-4" />
                    Cadastrar Nova Oficina
                  </button>
                </div>

                {loadingOficinas ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-500">Carregando oficinas...</p>
                  </div>
                ) : minhasOficinas.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {minhasOficinas.map(oficina => (
                      <div
                        key={oficina.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                      >
                        <div className="p-6">
                          <div className="mb-4 flex items-start justify-between">
                            <h3 className="text-lg font-bold">{oficina.nome}</h3>
                            {getStatusBadge(oficina.status)}
                          </div>

                          {oficina.endereco && (
                            <p className="mb-3 flex items-start gap-2 text-sm text-gray-500">
                              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                              {oficina.endereco}
                            </p>
                          )}

                          {oficina.telefone && (
                            <p className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="h-4 w-4" />
                              {oficina.telefone}
                            </p>
                          )}

                          {oficina.servicos_oferecidos &&
                            oficina.servicos_oferecidos.length > 0 && (
                              <div className="mb-4">
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
                            <button
                              onClick={() => router.push(`/oficina/${oficina.id}`)}
                              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                            >
                              Ver Detalhes
                            </button>
                            {oficina.status === 'ativo' && (
                              <button
                                onClick={() => router.push(`/admin/oficinas/editar/${oficina.id}`)}
                                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                              >
                                <Edit className="h-3 w-3" />
                                Editar
                              </button>
                            )}
                          </div>

                          {oficina.status === 'pendente' && (
                            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                              <p className="flex items-center gap-1 text-xs text-yellow-800">
                                <Clock className="h-3 w-3" />
                                Aguardando aprovação do administrador
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
                    <Store className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-xl font-semibold">Nenhuma oficina cadastrada</h3>
                    <p className="mb-6 text-gray-500">Comece cadastrando sua primeira oficina</p>
                    <button
                      onClick={() => router.push('/cadastro-oficina')}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                      <Store className="h-4 w-4" />
                      Cadastrar Oficina
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab de Configurações */}
            {(activeTab === 'preferencias' || activeTab === 'seguranca') && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-2xl font-bold">
                    {activeTab === 'seguranca' ? 'Segurança' : 'Preferências'}
                  </h2>
                  <p className="text-gray-500">
                    {activeTab === 'seguranca'
                      ? 'Gerencie suas configurações de segurança'
                      : 'Gerencie suas preferências e conta'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg">
                    <Bell className="mb-4 h-8 w-8 text-primary" />
                    <h3 className="mb-2 text-lg font-semibold">Notificações</h3>
                    <p className="mb-4 text-sm text-gray-500">
                      Gerencie como você recebe notificações
                    </p>
                    <button className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
                      Configurar
                    </button>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg">
                    <Shield className="mb-4 h-8 w-8 text-green-600" />
                    <h3 className="mb-2 text-lg font-semibold">Privacidade</h3>
                    <p className="mb-4 text-sm text-gray-500">
                      Controle suas configurações de privacidade
                    </p>
                    <button className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
                      Gerenciar
                    </button>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg">
                    <Settings className="mb-4 h-8 w-8 text-purple-600" />
                    <h3 className="mb-2 text-lg font-semibold">Alterar Senha</h3>
                    <p className="mb-4 text-sm text-gray-500">Atualize sua senha de acesso</p>
                    <button className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
                      Alterar
                    </button>
                  </div>

                  <div className="rounded-xl border-2 border-red-200 bg-white p-6 transition-all hover:shadow-lg">
                    <XCircle className="mb-4 h-8 w-8 text-red-600" />
                    <h3 className="mb-2 text-lg font-semibold">Excluir Conta</h3>
                    <p className="mb-4 text-sm text-gray-500">Remover permanentemente sua conta</p>
                    <button className="w-full rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === 'agendamentos' ||
              activeTab === 'veiculos' ||
              activeTab === 'pagamentos') && (
              <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
                <span className="material-icons-outlined mb-4 text-6xl text-gray-300">
                  {activeTab === 'agendamentos'
                    ? 'calendar_today'
                    : activeTab === 'veiculos'
                      ? 'directions_car'
                      : 'credit_card'}
                </span>
                <h3 className="mb-2 text-xl font-semibold">
                  {activeTab === 'agendamentos' && 'Meus Agendamentos'}
                  {activeTab === 'veiculos' && 'Meus Veículos'}
                  {activeTab === 'pagamentos' && 'Pagamentos'}
                </h3>
                <p className="mb-6 text-gray-500">
                  Esta funcionalidade estará disponível em breve.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Help Section */}
      <section className="border-t border-gray-200 bg-[#F7F7F7] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/20 text-primary">
            <span className="material-icons text-3xl">contact_support</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold">Precisa de ajuda?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-500">
            Nossa Central de Ajuda está pronta para tirar todas as suas dúvidas sobre serviços,
            agendamentos e garantias de forma rápida e eficiente.
          </p>
          <Link
            href="/ajuda"
            className="inline-block rounded-full border border-gray-900 px-8 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
          >
            Acessar Central de Ajuda
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
