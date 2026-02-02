'use client'

import {
  User,
  Settings,
  Bell,
  Shield,
  LogOut,
  Edit,
  Save,
  X,
  Phone,
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

interface Agendamento {
  id: string
  oficina_id: string
  tipo_servico: string
  marca_veiculo: string
  modelo_veiculo: string
  ano_veiculo?: string
  versao_veiculo?: string
  data_preferencial: string
  periodo: string
  descricao?: string
  nome_cliente: string
  telefone_cliente: string
  status: string
  valor_orcamento?: number
  created_at: string
  oficinas?: {
    nome: string
    endereco: string
    foto_url?: string
  }
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
  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null)
  const [showFeedbacks, setShowFeedbacks] = useState(false)
  const [meusAgendamentos, setMeusAgendamentos] = useState<Agendamento[]>([])
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(false)
  const [agendamentoDetalhes, setAgendamentoDetalhes] = useState<Agendamento | null>(null)
  const [showDetalhes, setShowDetalhes] = useState(false)
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

  const fetchMeusAgendamentos = useCallback(async () => {
    if (!user?.id) return

    setLoadingAgendamentos(true)
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(
          `
          *,
          oficinas (
            nome,
            endereco,
            foto_url
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMeusAgendamentos(data || [])
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err)
    } finally {
      setLoadingAgendamentos(false)
    }
  }, [user])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (activeTab === 'oficinas' && user?.id) {
      fetchMinhasOficinas()
    }
    if (activeTab === 'agendamentos' && user?.id) {
      fetchMeusAgendamentos()
    }
  }, [activeTab, user?.id, fetchMinhasOficinas, fetchMeusAgendamentos])

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
                {!selectedOficina ? (
                  <>
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
                                      {oficina.servicos_oferecidos
                                        .slice(0, 3)
                                        .map((servico, idx) => (
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
                                  onClick={() => setSelectedOficina(oficina)}
                                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                                >
                                  Ver Detalhes
                                </button>
                                {oficina.status === 'ativo' && (
                                  <button
                                    onClick={() =>
                                      router.push(`/admin/oficinas/editar/${oficina.id}`)
                                    }
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
                        <p className="mb-6 text-gray-500">
                          Comece cadastrando sua primeira oficina
                        </p>
                        <button
                          onClick={() => router.push('/cadastro-oficina')}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                          <Store className="h-4 w-4" />
                          Cadastrar Oficina
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  // Detalhes da Oficina Selecionada
                  <>
                    {/* Botão Voltar */}
                    <button
                      onClick={() => setSelectedOficina(null)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-4 w-4" />
                      Voltar para lista de oficinas
                    </button>

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="mb-2 text-3xl font-bold text-gray-900">
                          {selectedOficina.nome}
                        </h2>
                        <p className="text-gray-500">
                          Painel de controle e métricas da sua oficina
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(selectedOficina.status)}
                        <button
                          onClick={() =>
                            router.push(`/admin/oficinas/editar/${selectedOficina.id}`)
                          }
                          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                          Editar Oficina
                        </button>
                      </div>
                    </div>

                    {/* Cards de Métricas */}
                    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {/* Ganhos do Mês */}
                      <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Ganhos este mês</p>
                            <h3 className="mt-1 text-3xl font-bold text-gray-900">R$ 12.450</h3>
                          </div>
                          <div className="rounded-xl bg-green-50 p-3">
                            <span className="material-icons-outlined text-green-600">payments</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="flex items-center rounded bg-green-50 px-1.5 font-medium text-green-600">
                            <span className="material-icons mr-0.5 text-sm">arrow_upward</span> 12%
                          </span>
                          <span className="ml-1 text-gray-400">vs. mês anterior</span>
                        </div>
                      </div>

                      {/* Avaliação Média */}
                      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Avaliação Média</p>
                            <h3 className="mt-1 text-3xl font-bold text-gray-900">4.92</h3>
                          </div>
                          <div className="rounded-xl bg-yellow-50 p-3">
                            <span className="material-icons-outlined text-yellow-600">star</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-medium text-gray-900">128</span>
                          <span className="text-gray-400">avaliações totais</span>
                          <span className="mx-1 text-gray-300">|</span>
                          <button
                            onClick={() => setShowFeedbacks(true)}
                            className="cursor-pointer font-medium text-primary hover:underline"
                          >
                            Ver feedbacks
                          </button>
                        </div>
                      </div>

                      {/* Novas Mensagens */}
                      <div className="rounded-2xl border border-l-4 border-gray-200 border-l-primary bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Novas Mensagens</p>
                            <h3 className="mt-1 text-3xl font-bold text-gray-900">3</h3>
                          </div>
                          <div className="rounded-xl bg-rose-50 p-3">
                            <span className="material-icons-outlined text-primary">chat</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-gray-600">Tempo de resposta:</span>
                          <span className="font-medium text-gray-900">~1 hora</span>
                          <a
                            href="#"
                            className="ml-auto text-sm font-medium text-primary hover:underline"
                          >
                            Responder
                          </a>
                        </div>
                      </div>
                    </section>

                    {/* Informações da Oficina */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-6 text-xl font-bold text-gray-900">
                        Informações da Oficina
                      </h3>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Endereço */}
                        {selectedOficina.endereco && (
                          <div className="rounded-xl bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium">Endereço</span>
                            </div>
                            <p className="text-gray-900">{selectedOficina.endereco}</p>
                          </div>
                        )}

                        {/* Telefone */}
                        {selectedOficina.telefone && (
                          <div className="rounded-xl bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="h-4 w-4" />
                              <span className="font-medium">Telefone</span>
                            </div>
                            <p className="text-gray-900">{selectedOficina.telefone}</p>
                          </div>
                        )}

                        {/* Horário de Funcionamento */}
                        <div className="rounded-xl bg-gray-50 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Horário de Funcionamento</span>
                          </div>
                          <p className="text-gray-900">Seg - Sex: 8h às 18h</p>
                          <p className="text-sm text-gray-500">Sáb: 8h às 12h</p>
                        </div>

                        {/* Status */}
                        <div className="rounded-xl bg-gray-50 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Status da Conta</span>
                          </div>
                          <div className="mt-2">{getStatusBadge(selectedOficina.status)}</div>
                        </div>
                      </div>

                      {/* Serviços Oferecidos */}
                      {selectedOficina.servicos_oferecidos &&
                        selectedOficina.servicos_oferecidos.length > 0 && (
                          <div className="mt-6">
                            <h4 className="mb-3 text-sm font-medium text-gray-500">
                              Serviços Oferecidos
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedOficina.servicos_oferecidos.map((servico, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="border-primary/20 bg-primary/5 text-primary"
                                >
                                  {servico}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </section>

                    {/* Estatísticas e Dicas */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      {/* Estatísticas Rápidas */}
                      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <h3 className="mb-6 text-xl font-bold text-gray-900">
                          Estatísticas do Mês
                        </h3>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                            <div className="mb-2 text-2xl font-bold text-gray-900">28</div>
                            <div className="text-xs text-gray-500">Atendimentos</div>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                            <div className="mb-2 text-2xl font-bold text-green-600">92%</div>
                            <div className="text-xs text-gray-500">Taxa de Aceitação</div>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                            <div className="mb-2 text-2xl font-bold text-blue-600">1.2h</div>
                            <div className="text-xs text-gray-500">Tempo Resposta</div>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                            <div className="mb-2 text-2xl font-bold text-purple-600">15</div>
                            <div className="text-xs text-gray-500">Novos Clientes</div>
                          </div>
                        </div>

                        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                          <div className="flex gap-3">
                            <span className="material-icons-outlined text-blue-600">
                              trending_up
                            </span>
                            <div>
                              <h4 className="mb-1 text-sm font-bold text-gray-900">
                                Desempenho em alta
                              </h4>
                              <p className="text-xs leading-relaxed text-gray-600">
                                Sua oficina está entre as 10% mais bem avaliadas da região. Continue
                                mantendo esse excelente padrão de qualidade!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dica para Crescimento */}
                      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                          <span className="material-icons-outlined text-yellow-600">lightbulb</span>
                        </div>
                        <h4 className="mb-2 text-lg font-bold text-gray-900">
                          Dica para aumentar ganhos
                        </h4>
                        <p className="mb-4 text-sm leading-relaxed text-gray-700">
                          Oficinas que respondem em menos de 1 hora têm 40% mais chances de fechar o
                          serviço. Mantenha as notificações ativas!
                        </p>
                        <div className="mt-6 space-y-2 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Resposta rápida aumenta conversão</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Fotos do serviço geram confiança</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Avaliações positivas atraem clientes</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal de Feedbacks */}
                    {showFeedbacks && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                          {/* Header do Modal */}
                          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                  Avaliações e Feedbacks
                                </h2>
                                <p className="text-sm text-gray-500">{selectedOficina?.nome}</p>
                              </div>
                              <button
                                onClick={() => setShowFeedbacks(false)}
                                className="rounded-full p-2 transition-colors hover:bg-gray-100"
                              >
                                <X className="h-6 w-6 text-gray-500" />
                              </button>
                            </div>

                            {/* Resumo de Avaliações */}
                            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-full bg-white p-3 shadow-sm">
                                    <span className="material-icons-outlined text-3xl text-yellow-600">
                                      star
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-gray-900">4.92</div>
                                    <div className="text-sm text-gray-600">Média Geral</div>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-full bg-white p-3 shadow-sm">
                                    <span className="material-icons-outlined text-3xl text-blue-600">
                                      rate_review
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-gray-900">128</div>
                                    <div className="text-sm text-gray-600">Avaliações Totais</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Distribuição de Estrelas */}
                            <div className="mt-4 space-y-2">
                              {[5, 4, 3, 2, 1].map(stars => (
                                <div key={stars} className="flex items-center gap-3">
                                  <div className="flex w-12 items-center gap-0.5">
                                    <span className="text-sm font-medium text-gray-700">
                                      {stars}
                                    </span>
                                    <span className="material-icons text-sm text-yellow-500">
                                      star
                                    </span>
                                  </div>
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                      className="h-full bg-yellow-500"
                                      style={{
                                        width: `${
                                          stars === 5
                                            ? 75
                                            : stars === 4
                                              ? 18
                                              : stars === 3
                                                ? 5
                                                : stars === 2
                                                  ? 2
                                                  : 0
                                        }%`,
                                      }}
                                    />
                                  </div>
                                  <span className="w-12 text-right text-xs text-gray-500">
                                    {stars === 5
                                      ? '96'
                                      : stars === 4
                                        ? '23'
                                        : stars === 3
                                          ? '6'
                                          : stars === 2
                                            ? '2'
                                            : '1'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Lista de Avaliações */}
                          <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
                            <div className="space-y-6">
                              {/* Avaliação 1 */}
                              <div className="border-b border-gray-200 pb-6 last:border-b-0">
                                <div className="mb-3 flex items-start gap-3">
                                  <Image
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMO4S3RsGf0fqLa01jzc3bFfLmqis8216Aqzb5GQ7Goa3dzd_9tR2hfeW1tXDJK6EtjA9dgqirHsdFCpFBB151F5r-pTU9S86rgyWUOdwDvcHRTXWAWIVRKeD0yLkRsH-e-JDsa5SrsYdjw3LTt8JGIUP79hgNfS_dQLtVwp_RDTZhiY8JGmyMRVDdPsu9oKioH8J_deGcLRnev1S38s6gDcwEPiYGeHe261VjeNOS7DJNN4Mnf4C1DUcIM8ZBQnlL2bEvB2cBN98"
                                    alt="Avatar"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-semibold text-gray-900">
                                          Carlos Eduardo
                                        </h4>
                                        <p className="text-xs text-gray-500">Março de 2025</p>
                                      </div>
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <span
                                            key={star}
                                            className="material-icons text-lg text-yellow-500"
                                          >
                                            star
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-gray-700">
                                      Excelente atendimento! A equipe foi muito atenciosa e explicou
                                      todos os detalhes do diagnóstico. O trabalho foi feito com
                                      qualidade e no prazo combinado. Recomendo!
                                    </p>

                                    {/* Aspectos Avaliados */}
                                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                                        <span className="font-medium text-gray-700">Limpeza:</span>
                                        <span className="material-icons text-xs text-yellow-500">
                                          star
                                        </span>
                                        <span className="font-semibold text-gray-900">5.0</span>
                                      </div>
                                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                                        <span className="font-medium text-gray-700">
                                          Comunicação:
                                        </span>
                                        <span className="material-icons text-xs text-yellow-500">
                                          star
                                        </span>
                                        <span className="font-semibold text-gray-900">5.0</span>
                                      </div>
                                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                                        <span className="font-medium text-gray-700">Precisão:</span>
                                        <span className="material-icons text-xs text-yellow-500">
                                          star
                                        </span>
                                        <span className="font-semibold text-gray-900">5.0</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Avaliação 2 */}
                              <div className="border-b border-gray-200 pb-6 last:border-b-0">
                                <div className="mb-3 flex items-start gap-3">
                                  <Image
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwGu0masLad8_T3tFguLinnE4OFRT9HIpjta0rE_uLrEnt9Pq1L7a_Do-PGue1PJGDT9jyKYjV_yXQ6b6jDMZDPhBzXT_bzg5FbymE-xQD6PgKhhmdO5p1cFUha8fpcw6wVRCMpvBAs4T5qdsHsWUcRQ9RVGckidb96romZZ8C7MJF5fZHNkdSvB75y132KOTL3kVxT8CpN2QTIWiBPtFVrfg5w6nta7JMfCpspUYnnPHT7FGNxcnjrOlEi_QzKR_n8kBKIRV5SC4"
                                    alt="Avatar"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-semibold text-gray-900">
                                          Mariana Costa
                                        </h4>
                                        <p className="text-xs text-gray-500">Fevereiro de 2025</p>
                                      </div>
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4].map(star => (
                                          <span
                                            key={star}
                                            className="material-icons text-lg text-yellow-500"
                                          >
                                            star
                                          </span>
                                        ))}
                                        <span className="material-icons text-lg text-gray-300">
                                          star
                                        </span>
                                      </div>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-gray-700">
                                      Bom serviço, mas o tempo de espera foi um pouco maior do que o
                                      esperado. No geral, fiquei satisfeita com o resultado final.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                                        <span className="font-medium text-gray-700">Limpeza:</span>
                                        <span className="material-icons text-xs text-yellow-500">
                                          star
                                        </span>
                                        <span className="font-semibold text-gray-900">4.0</span>
                                      </div>
                                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                                        <span className="font-medium text-gray-700">
                                          Pontualidade:
                                        </span>
                                        <span className="material-icons text-xs text-yellow-500">
                                          star
                                        </span>
                                        <span className="font-semibold text-gray-900">3.0</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Avaliação 3 */}
                              <div className="border-b border-gray-200 pb-6 last:border-b-0">
                                <div className="mb-3 flex items-start gap-3">
                                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                    JP
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-semibold text-gray-900">João Paulo</h4>
                                        <p className="text-xs text-gray-500">Janeiro de 2025</p>
                                      </div>
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <span
                                            key={star}
                                            className="material-icons text-lg text-yellow-500"
                                          >
                                            star
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-gray-700">
                                      Ótimo custo-benefício! A oficina ofereceu um preço justo e o
                                      serviço foi de qualidade. Voltarei com certeza.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                                        <span className="font-medium text-gray-700">
                                          Custo-benefício:
                                        </span>
                                        <span className="material-icons text-xs text-yellow-500">
                                          star
                                        </span>
                                        <span className="font-semibold text-gray-900">5.0</span>
                                      </div>
                                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                                        <span className="font-medium text-gray-700">
                                          Qualidade:
                                        </span>
                                        <span className="material-icons text-xs text-yellow-500">
                                          star
                                        </span>
                                        <span className="font-semibold text-gray-900">5.0</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer do Modal */}
                          <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500">Mostrando 3 de 128 avaliações</p>
                              <button
                                onClick={() => setShowFeedbacks(false)}
                                className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                              >
                                Fechar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
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

            {/* Tab de Agendamentos */}
            {activeTab === 'agendamentos' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Meus Agendamentos</h2>
                    <p className="mt-1 text-gray-500">
                      Gerencie seus serviços e acompanhe o status
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm font-medium">
                    <button className="rounded-lg border-b-2 border-primary px-4 py-2 text-primary">
                      Próximos
                    </button>
                    <button className="rounded-lg border-b-2 border-transparent px-4 py-2 text-gray-500 hover:text-gray-800">
                      Concluídos
                    </button>
                    <button className="rounded-lg border-b-2 border-transparent px-4 py-2 text-gray-500 hover:text-gray-800">
                      Cancelados
                    </button>
                  </div>
                </div>

                {loadingAgendamentos ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-500">Carregando agendamentos...</p>
                  </div>
                ) : meusAgendamentos.length === 0 ? (
                  <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
                    <span className="material-icons-outlined mb-4 text-6xl text-gray-300">
                      calendar_today
                    </span>
                    <h3 className="mb-2 text-xl font-semibold">Nenhum agendamento ainda</h3>
                    <p className="mb-6 text-gray-500">
                      Comece agendando um serviço em uma oficina parceira
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                      Buscar Oficinas
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Lista de Agendamentos */}
                    <div className="space-y-6">
                      {meusAgendamentos
                        .filter(ag => ag.status !== 'cancelado' && ag.status !== 'concluido')
                        .map(agendamento => (
                          <div
                            key={agendamento.id}
                            className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                          >
                            <div className="flex flex-col md:flex-row">
                              <div className="relative h-48 w-full flex-shrink-0 overflow-hidden md:h-auto md:w-72">
                                <Image
                                  src={
                                    agendamento.oficinas?.foto_url ||
                                    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400'
                                  }
                                  alt={agendamento.oficinas?.nome || 'Oficina'}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm backdrop-blur-sm">
                                  <span className="material-icons-outlined text-xs">
                                    calendar_today
                                  </span>
                                  {new Date(agendamento.data_preferencial).toLocaleDateString(
                                    'pt-BR',
                                    { day: '2-digit', month: 'short' }
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-1 flex-col justify-between p-6">
                                <div>
                                  <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-primary">
                                        {agendamento.oficinas?.nome || 'Oficina'}
                                      </h3>
                                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                                        <MapPin className="h-4 w-4" />
                                        {agendamento.oficinas?.endereco ||
                                          'Endereço não disponível'}
                                      </p>
                                    </div>
                                    <Badge
                                      className={`self-start ${
                                        agendamento.status === 'confirmado'
                                          ? 'border-green-200 bg-green-100 text-green-700'
                                          : agendamento.status === 'pendente'
                                            ? 'border-amber-200 bg-amber-100 text-amber-700'
                                            : 'border-gray-200 bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {agendamento.status === 'confirmado' && (
                                        <>
                                          <CheckCircle className="mr-1 h-3 w-3" />
                                          Confirmado
                                        </>
                                      )}
                                      {agendamento.status === 'pendente' && (
                                        <>
                                          <Clock className="mr-1 h-3 w-3 animate-pulse" />
                                          Aguardando Confirmação
                                        </>
                                      )}
                                    </Badge>
                                  </div>
                                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                      <div className="rounded-lg bg-gray-50 p-2 text-gray-600">
                                        <span className="material-icons-outlined">car_repair</span>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                          Serviço
                                        </p>
                                        <p className="font-medium text-gray-900">
                                          {agendamento.tipo_servico}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {agendamento.marca_veiculo} {agendamento.modelo_veiculo}
                                          {agendamento.ano_veiculo && ` ${agendamento.ano_veiculo}`}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className="rounded-lg bg-gray-50 p-2 text-gray-600">
                                        <Clock className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                          Período
                                        </p>
                                        <p className="font-medium text-gray-900">
                                          {agendamento.periodo === 'manha'
                                            ? 'Manhã (8h - 12h)'
                                            : 'Tarde (13h - 18h)'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
                                  {agendamento.valor_orcamento ? (
                                    <span className="mr-auto text-lg font-semibold text-gray-900">
                                      R$ {agendamento.valor_orcamento.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="mr-auto text-sm italic text-gray-500">
                                      Aguardando orçamento
                                    </span>
                                  )}
                                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                                    Enviar Mensagem
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAgendamentoDetalhes(agendamento)
                                      setShowDetalhes(true)
                                    }}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-primary/30 transition hover:brightness-90"
                                  >
                                    Ver Detalhes
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === 'veiculos' || activeTab === 'pagamentos') && (
              <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
                <span className="material-icons-outlined mb-4 text-6xl text-gray-300">
                  {activeTab === 'veiculos' ? 'directions_car' : 'credit_card'}
                </span>
                <h3 className="mb-2 text-xl font-semibold">
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

      {/* Modal de Detalhes do Agendamento */}
      {showDetalhes && agendamentoDetalhes && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDetalhes(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <span className="material-icons-outlined text-primary">event_note</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Detalhes do Agendamento</h2>
                    <p className="text-sm text-gray-500">
                      Solicitado em{' '}
                      {new Date(agendamentoDetalhes.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetalhes(false)}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                >
                  <span className="material-icons-outlined text-gray-500">close</span>
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {/* Status Badge */}
              <div className="mb-6 flex justify-center">
                <Badge
                  className={`px-4 py-2 text-base ${
                    agendamentoDetalhes.status === 'confirmado'
                      ? 'border-green-200 bg-green-100 text-green-700'
                      : agendamentoDetalhes.status === 'pendente'
                        ? 'border-amber-200 bg-amber-100 text-amber-700'
                        : 'border-gray-200 bg-gray-100 text-gray-700'
                  }`}
                >
                  {agendamentoDetalhes.status === 'confirmado' && (
                    <>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Confirmado
                    </>
                  )}
                  {agendamentoDetalhes.status === 'pendente' && (
                    <>
                      <Clock className="mr-1 h-4 w-4 animate-pulse" />
                      Aguardando Confirmação
                    </>
                  )}
                </Badge>
              </div>

              {/* Informações da Oficina */}
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <span className="material-icons-outlined text-sm">store</span>
                  Oficina
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {agendamentoDetalhes.oficinas?.nome || 'Oficina'}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {agendamentoDetalhes.oficinas?.endereco || 'Endereço não disponível'}
                </p>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Tipo de Serviço */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                    <span className="material-icons-outlined text-sm">car_repair</span>
                    Tipo de Serviço
                  </div>
                  <p className="font-semibold text-gray-900">{agendamentoDetalhes.tipo_servico}</p>
                </div>

                {/* Data Preferencial */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                    <span className="material-icons-outlined text-sm">calendar_today</span>
                    Data Preferencial
                  </div>
                  <p className="font-semibold text-gray-900">
                    {new Date(agendamentoDetalhes.data_preferencial).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Período */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    Período
                  </div>
                  <p className="font-semibold text-gray-900">
                    {agendamentoDetalhes.periodo === 'manha'
                      ? 'Manhã (8h - 12h)'
                      : 'Tarde (13h - 18h)'}
                  </p>
                </div>

                {/* Valor do Orçamento */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                    <span className="material-icons-outlined text-sm">payments</span>
                    Valor do Orçamento
                  </div>
                  {agendamentoDetalhes.valor_orcamento ? (
                    <p className="text-xl font-bold text-green-600">
                      R$ {agendamentoDetalhes.valor_orcamento.toFixed(2)}
                    </p>
                  ) : (
                    <p className="italic text-gray-500">Aguardando orçamento</p>
                  )}
                </div>
              </div>

              {/* Informações do Veículo */}
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <span className="material-icons-outlined text-sm">directions_car</span>
                  Informações do Veículo
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-500">Marca</p>
                    <p className="font-semibold text-gray-900">
                      {agendamentoDetalhes.marca_veiculo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Modelo</p>
                    <p className="font-semibold text-gray-900">
                      {agendamentoDetalhes.modelo_veiculo}
                    </p>
                  </div>
                  {agendamentoDetalhes.ano_veiculo && (
                    <div>
                      <p className="text-xs text-gray-500">Ano</p>
                      <p className="font-semibold text-gray-900">
                        {agendamentoDetalhes.ano_veiculo}
                      </p>
                    </div>
                  )}
                  {agendamentoDetalhes.versao_veiculo && (
                    <div>
                      <p className="text-xs text-gray-500">Versão</p>
                      <p className="font-semibold text-gray-900">
                        {agendamentoDetalhes.versao_veiculo}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Descrição (se houver) */}
              {agendamentoDetalhes.descricao && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-amber-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                    <span className="material-icons-outlined text-sm">description</span>
                    Descrição do Problema
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {agendamentoDetalhes.descricao}
                  </p>
                </div>
              )}

              {/* Contato do Cliente */}
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                  <span className="material-icons-outlined text-sm">contact_phone</span>
                  Seus Dados de Contato
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-gray-600">person</span>
                    <div>
                      <p className="text-xs text-gray-500">Nome</p>
                      <p className="font-semibold text-gray-900">
                        {agendamentoDetalhes.nome_cliente}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-gray-600">phone</span>
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="font-semibold text-gray-900">
                        {agendamentoDetalhes.telefone_cliente}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
                <button className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50">
                  <span className="material-icons-outlined mr-2 align-middle text-sm">message</span>
                  Enviar Mensagem
                </button>
                {agendamentoDetalhes.status === 'pendente' && (
                  <button className="flex-1 rounded-lg border border-red-300 px-4 py-3 font-medium text-red-600 transition hover:bg-red-50">
                    <span className="material-icons-outlined mr-2 align-middle text-sm">
                      cancel
                    </span>
                    Cancelar Agendamento
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
