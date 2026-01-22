'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useNotifications } from '@/contexts/NotificationContext'
import { supabase } from '@/lib/supabase'

type AccountType = 'pessoal' | 'empresa' | null
type UserType = 'cliente' | 'oficina' | null

interface SignupFormData {
  telefone: string
  tipoContaEmpresa: AccountType
  tipoUsuario: UserType
  nome: string
  email: string
  password: string
  confirmPassword: string
  cpf?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  dataNascimento?: string
  genero?: string
  aceitaTermos?: boolean
  aceitaMarketing?: boolean
  nomeEmpresa?: string
  cnpj?: string
  razaoSocial?: string
  nomeOficina?: string
  especialidades?: string[]
  horarioFuncionamento?: string
  descricao?: string
}

export default function SignupPage() {
  const router = useRouter()
  const { success, error: showError } = useNotifications()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SignupFormData>({
    telefone: '',
    tipoContaEmpresa: null,
    tipoUsuario: null,
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    aceitaTermos: false,
    aceitaMarketing: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailExists, setEmailExists] = useState(false)

  const getTotalSteps = () => (formData.tipoUsuario === 'cliente' ? 5 : 4)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/)
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`
    return value
  }

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/)
    if (match) return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`
    return value
  }

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/)
    if (match) return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`
    return value
  }

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{5})(\d{3})$/)
    if (match) return `${match[1]}-${match[2]}`
    return value
  }

  const checkEmailExists = async (email: string) => {
    if (!email || email.length < 5) return
    try {
      const { data } = await supabase.from('usuarios').select('id').eq('email', email).limit(1)
      setEmailExists(Boolean(data && data.length > 0))
    } catch (e) {
      console.error('Erro ao verificar email:', e)
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.telefone.replace(/\D/g, '').length === 11
      case 2:
        return formData.tipoContaEmpresa !== null && formData.tipoUsuario !== null
      case 3:
        return (
          formData.nome !== '' &&
          formData.email !== '' &&
          formData.password.length >= 6 &&
          formData.password === formData.confirmPassword &&
          !emailExists
        )
      case 4:
        if (formData.tipoUsuario === 'oficina') {
          return !!(formData.nomeOficina && formData.endereco && formData.cidade && formData.estado)
        }
        return !!(formData.cpf && formData.endereco && formData.cidade && formData.estado)
      case 5:
        return formData.aceitaTermos === true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < getTotalSteps()) {
      setCurrentStep(prev => prev + 1)
      setError('')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setError('')
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!validateStep(getTotalSteps())) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.nome, phone: formData.telefone } },
      })

      if (error) throw error

      if (data?.user) {
        const userData: Record<string, unknown> = {
          id: data.user.id,
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          tipo: formData.tipoUsuario,
        }

        if (formData.tipoContaEmpresa === 'empresa') {
          if (formData.nomeEmpresa) userData.nome_empresa = formData.nomeEmpresa
          if (formData.cnpj) userData.cnpj = formData.cnpj
          if (formData.razaoSocial) userData.razao_social = formData.razaoSocial
        }

        if (formData.tipoUsuario === 'oficina') {
          if (formData.nomeOficina) userData.nome_oficina = formData.nomeOficina
        }

        if (formData.endereco) userData.endereco = formData.endereco
        if (formData.cidade) userData.cidade = formData.cidade
        if (formData.estado) userData.estado = formData.estado
        if (formData.cep) userData.cep = formData.cep
        if (formData.cpf) userData.cpf = formData.cpf

        await supabase.from('usuarios').insert(userData)
      }

      if (data?.session) {
        success('Conta criada com sucesso!', 'Bem-vindo ao ComparAuto!')
        router.push('/')
      } else {
        success('Conta criada!', 'Verifique seu email para confirmar sua conta.')
        router.push(`/signup/confirm-email?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(message)
      showError('Erro', message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignup = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider })
      if (error) setError('Erro ao cadastrar com ' + provider)
    } catch {
      setError('Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white ">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 ">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-icons text-3xl text-primary">build_circle</span>
          <span className="text-xl font-bold text-gray-900 ">ComparAuto</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm  text-gray-600 sm:block">Já tem uma conta?</span>
          <Link
            href="/login"
            className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-grow items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500 ">
                Etapa {currentStep} de {getTotalSteps()}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round((currentStep / getTotalSteps()) * 100)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden  rounded-full bg-gray-200">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl  border border-gray-200  bg-white p-8 shadow-card">
            {error && (
              <div className="mb-6 flex items-center  gap-3 rounded-xl  border border-red-200 bg-red-50 p-4">
                <span className="material-icons text-red-500">error_outline</span>
                <span className="text-sm text-red-600 ">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup}>
              {/* Step 1: Phone */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-6 text-center">
                    <h1 className="mb-2 text-2xl font-semibold  text-gray-900">Vamos começar!</h1>
                    <p className="text-gray-500 ">Digite seu número de telefone</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          telefone: formatPhoneNumber(e.target.value),
                        }))
                      }
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2  focus:ring-primary/50 "
                    />
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(1)}
                    className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
                  >
                    Continuar
                  </button>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200 "></div>
                    <span className="text-sm text-gray-500">ou cadastre-se com</span>
                    <div className="h-px flex-1 bg-gray-200 "></div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleOAuthSignup('google')}
                      className=":bg-gray-800 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300  px-4 py-3 font-medium transition hover:bg-gray-50"
                    >
                      <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
                      <span className="text-gray-700 ">Continuar com Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuthSignup('facebook')}
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-3 font-medium text-white transition hover:bg-[#166FE5]"
                    >
                      <span className="material-icons">facebook</span>
                      <span>Continuar com Facebook</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Account Type */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="mb-6 text-center">
                    <h1 className="mb-2 text-2xl font-semibold  text-gray-900">Tipo de conta</h1>
                    <p className="text-gray-500 ">Selecione como você usará a plataforma</p>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium  text-gray-700">
                      Tipo de conta
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['pessoal', 'empresa'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tipoContaEmpresa: type }))}
                          className={`rounded-xl border-2 p-4 text-left transition ${formData.tipoContaEmpresa === type ? 'border-primary bg-primary/5' : 'border-gray-200  hover:border-gray-300'}`}
                        >
                          <span className="material-icons mb-2 block text-2xl">
                            {type === 'pessoal' ? 'person' : 'business'}
                          </span>
                          <span className="block font-medium  text-gray-900">
                            {type === 'pessoal' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {type === 'pessoal' ? 'Para uso pessoal' : 'Para empresas'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium  text-gray-700">
                      Como você usará?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['cliente', 'oficina'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tipoUsuario: type }))}
                          className={`rounded-xl border-2 p-4 text-left transition ${formData.tipoUsuario === type ? 'border-primary bg-primary/5' : 'border-gray-200  hover:border-gray-300'}`}
                        >
                          <span className="material-icons mb-2 block text-2xl">
                            {type === 'cliente' ? 'directions_car' : 'build'}
                          </span>
                          <span className="block font-medium  text-gray-900">
                            {type === 'cliente' ? 'Sou Cliente' : 'Tenho Oficina'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {type === 'cliente' ? 'Buscar serviços' : 'Oferecer serviços'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={prevStep}
                      className=":bg-gray-800 flex flex-1 items-center  justify-center  gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <span className="material-icons text-sm">arrow_back</span> Voltar
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(2)}
                      className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Basic Info */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="mb-6 text-center">
                    <h1 className="mb-2 text-2xl font-semibold  text-gray-900">Dados básicos</h1>
                    <p className="text-gray-500 ">Informe seus dados para criar a conta</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2  focus:ring-primary/50 "
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={e => {
                        handleChange(e)
                        checkEmailExists(e.target.value)
                      }}
                      placeholder="seu@email.com"
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2  focus:ring-primary/50  ${emailExists ? 'border-red-500' : 'border-gray-300 '}`}
                    />
                    {emailExists && (
                      <p className="mt-1.5 text-sm text-red-500">Este e-mail já está cadastrado</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                        Senha *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4  py-3 pr-10 text-gray-900 focus:border-primary focus:outline-none focus:ring-2  focus:ring-primary/50 "
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          <span className="material-icons-outlined text-xl">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                        Confirmar *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirme a senha"
                          className={`w-full rounded-xl border bg-white px-4 py-3 pr-10 text-gray-900 focus:border-primary focus:outline-none focus:ring-2  focus:ring-primary/50  ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : 'border-gray-300 '}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          <span className="material-icons-outlined text-xl">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={prevStep}
                      className=":bg-gray-800 flex flex-1 items-center  justify-center  gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <span className="material-icons text-sm">arrow_back</span> Voltar
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(3)}
                      className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Address/Workshop Info */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="mb-6 text-center">
                    <h1 className="mb-2 text-2xl font-semibold  text-gray-900">
                      {formData.tipoUsuario === 'oficina' ? 'Dados da Oficina' : 'Endereço'}
                    </h1>
                    <p className="text-gray-500 ">
                      {formData.tipoUsuario === 'oficina'
                        ? 'Informe os dados da sua oficina'
                        : 'Onde você está localizado?'}
                    </p>
                  </div>

                  {formData.tipoUsuario === 'oficina' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                        Nome da Oficina *
                      </label>
                      <input
                        type="text"
                        name="nomeOficina"
                        value={formData.nomeOficina || ''}
                        onChange={handleChange}
                        placeholder="Nome da oficina"
                        className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2  focus:ring-primary/50 "
                      />
                    </div>
                  )}

                  {formData.tipoUsuario === 'cliente' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                        CPF *
                      </label>
                      <input
                        type="text"
                        value={formData.cpf || ''}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))
                        }
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2  focus:ring-primary/50 "
                      />
                    </div>
                  )}

                  {formData.tipoContaEmpresa === 'empresa' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                          Nome Empresa
                        </label>
                        <input
                          type="text"
                          name="nomeEmpresa"
                          value={formData.nomeEmpresa || ''}
                          onChange={handleChange}
                          placeholder="Nome da empresa"
                          className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3  text-gray-900 "
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                          CNPJ
                        </label>
                        <input
                          type="text"
                          value={formData.cnpj || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))
                          }
                          placeholder="00.000.000/0000-00"
                          maxLength={18}
                          className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3  text-gray-900 "
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                      Endereço *
                    </label>
                    <input
                      type="text"
                      name="endereco"
                      value={formData.endereco || ''}
                      onChange={handleChange}
                      placeholder="Rua, número, bairro"
                      className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2  focus:ring-primary/50 "
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        name="cidade"
                        value={formData.cidade || ''}
                        onChange={handleChange}
                        placeholder="Cidade"
                        className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3  text-gray-900 "
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium  text-gray-700">
                        Estado *
                      </label>
                      <select
                        name="estado"
                        value={formData.estado || ''}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3  text-gray-900 "
                      >
                        <option value="">UF</option>
                        {[
                          'AC',
                          'AL',
                          'AP',
                          'AM',
                          'BA',
                          'CE',
                          'DF',
                          'ES',
                          'GO',
                          'MA',
                          'MT',
                          'MS',
                          'MG',
                          'PA',
                          'PB',
                          'PR',
                          'PE',
                          'PI',
                          'RJ',
                          'RN',
                          'RS',
                          'RO',
                          'RR',
                          'SC',
                          'SP',
                          'SE',
                          'TO',
                        ].map(uf => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium  text-gray-700">CEP</label>
                    <input
                      type="text"
                      value={formData.cep || ''}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, cep: formatCEP(e.target.value) }))
                      }
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full rounded-xl border border-gray-300 bg-white  px-4 py-3  text-gray-900 "
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={prevStep}
                      className=":bg-gray-800 flex flex-1 items-center  justify-center  gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <span className="material-icons text-sm">arrow_back</span> Voltar
                    </button>
                    <button
                      type={formData.tipoUsuario === 'oficina' ? 'submit' : 'button'}
                      onClick={formData.tipoUsuario !== 'oficina' ? nextStep : undefined}
                      disabled={!validateStep(4) || (formData.tipoUsuario === 'oficina' && loading)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
                    >
                      {formData.tipoUsuario === 'oficina' && loading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>{' '}
                          Criando...
                        </>
                      ) : formData.tipoUsuario === 'oficina' ? (
                        'Criar conta'
                      ) : (
                        'Continuar'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Terms (Client only) */}
              {currentStep === 5 && formData.tipoUsuario === 'cliente' && (
                <div className="space-y-6">
                  <div className="mb-6 text-center">
                    <h1 className="mb-2 text-2xl font-semibold  text-gray-900">Quase lá!</h1>
                    <p className="text-gray-500 ">Revise e aceite os termos para finalizar</p>
                  </div>

                  <div className="space-y-4  rounded-xl bg-[#F7F7F7] p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <span className="material-icons text-primary">check</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 ">{formData.nome}</p>
                        <p className="text-sm text-gray-500">{formData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <span className="material-icons text-primary">phone</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 ">{formData.telefone}</p>
                        <p className="text-sm text-gray-500">
                          {formData.cidade}, {formData.estado}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.aceitaTermos}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, aceitaTermos: e.target.checked }))
                        }
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600 ">
                        Li e aceito os{' '}
                        <Link href="/termos" className="text-primary hover:underline">
                          Termos de Uso
                        </Link>{' '}
                        e a{' '}
                        <Link href="/privacidade" className="text-primary hover:underline">
                          Política de Privacidade
                        </Link>{' '}
                        *
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.aceitaMarketing}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, aceitaMarketing: e.target.checked }))
                        }
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600 ">
                        Quero receber novidades e ofertas por e-mail
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={prevStep}
                      className=":bg-gray-800 flex flex-1 items-center  justify-center  gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <span className="material-icons text-sm">arrow_back</span> Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={!validateStep(5) || loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>{' '}
                          Criando...
                        </>
                      ) : (
                        <>
                          <span className="material-icons">check_circle</span> Criar conta
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 ">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
