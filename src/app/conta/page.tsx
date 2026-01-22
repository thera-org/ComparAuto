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
            <Button onClick={() => router.push('/login')} className="mt-4 bg-primary hover:bg-primary-hover">
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Olá, {user.nome?.split(' ')[0] || 'Usuário'}!</h1>
              <p className="text-gray-500">Gerencie seus dados e serviços automotivos.</p>
            </div>

            {/* Profile Completion Card */}
            {profileCompletion < 100 && (
              <div className="bg-[#F7F7F7] p-4 rounded-xl shadow-subtle flex items-center gap-4 max-w-md w-full border border-gray-200">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
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
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-primary">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Complete seu perfil</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Adicione suas informações para recomendações personalizadas.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('perfil')
                    setEdit(true)
                  }}
                  className="text-sm text-primary font-medium hover:underline whitespace-nowrap"
                >
                  Completar
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === item.id
                      ? 'bg-gray-100 text-primary font-medium'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="material-icons-outlined text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-8 border-t border-gray-200 pt-6 px-4">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {QUICK_ACTIONS.map((action) => (
                    <div
                      key={action.id}
                      onClick={() => action.href ? router.push(action.href) : setActiveTab(action.tab || 'perfil')}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="mb-4 text-primary bg-red-50 w-12 h-12 rounded-full flex items-center justify-center">
                        <span className="material-icons-outlined">{action.icon}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">{action.desc}</p>
                      <span className="text-sm font-medium underline decoration-gray-300 underline-offset-4 group-hover:decoration-primary transition-all">
                        {action.action}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Personal Info Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Informações Pessoais</h2>
                    <button
                      onClick={() => setEdit(true)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                  </div>

                  <div className="flex items-start gap-6 mb-6">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg'
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">{user.nome || 'Nome não informado'}</h3>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Telefone</p>
                      <p className="font-medium">{user.telefone || 'Não informado'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Endereço</p>
                      <p className="font-medium">{user.endereco || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Edit Profile Form */}
            {activeTab === 'perfil' && edit && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Editar Informações</h2>
                  <button
                    onClick={() => setEdit(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Upload */}
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
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                          <User className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 shadow-lg hover:bg-primary-hover transition-colors">
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
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG ou GIF. Max 2MB</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                      <input
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">E-mail *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Telefone</label>
                      <input
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Endereço</label>
                      <input
                        name="endereco"
                        value={form.endereco}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Rua, Número, Cidade - Estado"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 px-6 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                      className="px-8 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
                    <p className="text-gray-500 mt-1">Gerencie suas oficinas cadastradas</p>
                  </div>
                  <button
                    onClick={() => router.push('/cadastro-oficina')}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {minhasOficinas.map((oficina) => (
                      <div
                        key={oficina.id}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-bold">{oficina.nome}</h3>
                            {getStatusBadge(oficina.status)}
                          </div>

                          {oficina.endereco && (
                            <p className="flex items-start gap-2 text-gray-500 mb-3 text-sm">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {oficina.endereco}
                            </p>
                          )}

                          {oficina.telefone && (
                            <p className="flex items-center gap-2 text-gray-500 mb-3 text-sm">
                              <Phone className="h-4 w-4" />
                              {oficina.telefone}
                            </p>
                          )}

                          {oficina.servicos_oferecidos && oficina.servicos_oferecidos.length > 0 && (
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

                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => router.push(`/oficina/${oficina.id}`)}
                              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                              Ver Detalhes
                            </button>
                            {oficina.status === 'ativo' && (
                              <button
                                onClick={() => router.push(`/admin/oficinas/editar/${oficina.id}`)}
                                className="flex-1 py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Editar
                              </button>
                            )}
                          </div>

                          {oficina.status === 'pendente' && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-xs text-yellow-800 flex items-center gap-1">
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
                  <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
                    <Store className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma oficina cadastrada</h3>
                    <p className="text-gray-500 mb-6">Comece cadastrando sua primeira oficina</p>
                    <button
                      onClick={() => router.push('/cadastro-oficina')}
                      className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
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
                  <h2 className="text-2xl font-bold mb-2">
                    {activeTab === 'seguranca' ? 'Segurança' : 'Preferências'}
                  </h2>
                  <p className="text-gray-500">
                    {activeTab === 'seguranca'
                      ? 'Gerencie suas configurações de segurança'
                      : 'Gerencie suas preferências e conta'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <Bell className="mb-4 h-8 w-8 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Notificações</h3>
                    <p className="text-gray-500 text-sm mb-4">Gerencie como você recebe notificações</p>
                    <button className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      Configurar
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <Shield className="mb-4 h-8 w-8 text-green-600" />
                    <h3 className="text-lg font-semibold mb-2">Privacidade</h3>
                    <p className="text-gray-500 text-sm mb-4">Controle suas configurações de privacidade</p>
                    <button className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      Gerenciar
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <Settings className="mb-4 h-8 w-8 text-purple-600" />
                    <h3 className="text-lg font-semibold mb-2">Alterar Senha</h3>
                    <p className="text-gray-500 text-sm mb-4">Atualize sua senha de acesso</p>
                    <button className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      Alterar
                    </button>
                  </div>

                  <div className="bg-white border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <XCircle className="mb-4 h-8 w-8 text-red-600" />
                    <h3 className="text-lg font-semibold mb-2">Excluir Conta</h3>
                    <p className="text-gray-500 text-sm mb-4">Remover permanentemente sua conta</p>
                    <button className="w-full py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === 'agendamentos' || activeTab === 'veiculos' || activeTab === 'pagamentos') && (
              <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
                <span className="material-icons-outlined text-6xl text-gray-300 mb-4">
                  {activeTab === 'agendamentos' ? 'calendar_today' : activeTab === 'veiculos' ? 'directions_car' : 'credit_card'}
                </span>
                <h3 className="text-xl font-semibold mb-2">
                  {activeTab === 'agendamentos' && 'Meus Agendamentos'}
                  {activeTab === 'veiculos' && 'Meus Veículos'}
                  {activeTab === 'pagamentos' && 'Pagamentos'}
                </h3>
                <p className="text-gray-500 mb-6">Esta funcionalidade estará disponível em breve.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Help Section */}
      <section className="bg-[#F7F7F7] py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-primary/20 text-primary mb-6">
            <span className="material-icons text-3xl">contact_support</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Precisa de ajuda?</h2>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Nossa Central de Ajuda está pronta para tirar todas as suas dúvidas sobre serviços, agendamentos e garantias de forma rápida e eficiente.
          </p>
          <Link
            href="/ajuda"
            className="inline-block px-8 py-3 rounded-full border border-gray-900 text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
          >
            Acessar Central de Ajuda
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
