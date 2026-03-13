'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useNotifications } from '@/contexts/NotificationContext'
import { supabase } from '@/lib/supabase'

import type { SignupFormData } from './_types'
import { Step1Phone } from './steps/Step1Phone'
import { Step2AccountType } from './steps/Step2AccountType'
import { Step3BasicInfo } from './steps/Step3BasicInfo'
import { Step4Details } from './steps/Step4Details'
import { Step5Terms } from './steps/Step5Terms'

const INITIAL_FORM: SignupFormData = {
  telefone: '',
  tipoContaEmpresa: null,
  tipoUsuario: null,
  nome: '',
  email: '',
  password: '',
  confirmPassword: '',
  aceitaTermos: false,
  aceitaMarketing: false,
}

export default function SignupPage() {
  const router = useRouter()
  const { success, error: showError } = useNotifications()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SignupFormData>(INITIAL_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const totalSteps = formData.tipoUsuario === 'cliente' ? 5 : 4
  const progressPercent = Math.round((currentStep / totalSteps) * 100)

  const onChange = (partial: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...partial }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1)
      setError('')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1)
      setError('')
    }
  }

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true)
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` },
      })
      if (oauthError) throw oauthError
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao autenticar'
      setError(message)
      showError('Erro', message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Guarda contra submissão em etapa intermediária (ex: Enter acidental)
    const isCliente = formData.tipoUsuario === 'cliente'
    const isOficina = formData.tipoUsuario === 'oficina'
    const lastStep = isCliente ? 5 : isOficina ? 4 : null
    if (currentStep !== lastStep) return

    if (!formData.email || !formData.password || !formData.nome || !formData.telefone) return
    if (isCliente && !formData.aceitaTermos) return

    try {
      setLoading(true)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.nome, phone: formData.telefone } },
      })

      if (signUpError) throw signUpError

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

        if (formData.tipoUsuario === 'oficina' && formData.nomeOficina) {
          userData.nome_oficina = formData.nomeOficina
        }

        if (formData.endereco) userData.endereco = formData.endereco
        if (formData.cidade) userData.cidade = formData.cidade
        if (formData.estado) userData.estado = formData.estado
        if (formData.cep) userData.cep = formData.cep
        if (formData.cpf) userData.cpf = formData.cpf

        if (data.session) {
          // Sessão ativa: inserção direta funciona pois auth.uid() === id satisfaz o RLS
          const { error: insertError } = await supabase.from('usuarios').insert(userData)
          if (insertError) throw insertError
        } else {
          // Fluxo de confirmação de e-mail: sem sessão, auth.uid() seria NULL e o RLS
          // bloquearia o INSERT. Delegamos ao servidor (service role) para contornar isso.
          const res = await fetch('/api/auth/register-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          })
          if (!res.ok) {
            const json = (await res.json()) as { error?: string }
            throw new Error(json.error ?? 'Erro ao criar perfil')
          }
        }
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

  const stepProps = {
    formData,
    onChange,
    onNext: nextStep,
    onPrev: prevStep,
    onOAuth: handleOAuth,
    isLoading: loading,
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-icons text-3xl text-primary">build_circle</span>
          <span className="text-xl font-bold text-gray-900">ComparAuto</span>
        </Link>
      </header>

      <main className="flex flex-grow items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Etapa {currentStep} de {totalSteps}
              </span>
              <span className="text-sm font-medium text-primary">{progressPercent}% concluído</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <span className="material-icons text-red-500">error_outline</span>
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup}>
              {currentStep === 1 && <Step1Phone {...stepProps} />}
              {currentStep === 2 && <Step2AccountType {...stepProps} />}
              {currentStep === 3 && <Step3BasicInfo {...stepProps} />}
              {currentStep === 4 && <Step4Details {...stepProps} />}
              {currentStep === 5 && formData.tipoUsuario === 'cliente' && (
                <Step5Terms {...stepProps} />
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
