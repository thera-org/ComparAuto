'use client'

import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

import { supabase } from '@/lib/supabase'

import styles from './confirm-email.module.css'

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Cooldown para reenvio
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  // Verifica se o usuário já está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
      }
    }
    checkAuth()

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    setResendMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        setResendMessage('Erro ao reenviar e-mail. Tente novamente.')
      } else {
        setResendMessage('E-mail reenviado com sucesso! Verifique sua caixa de entrada.')
        setResendCooldown(60) // 60 segundos de cooldown
      }
    } catch {
      setResendMessage('Erro inesperado. Tente novamente.')
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToSignup = () => {
    router.push('/signup')
  }

  const handleGoToLogin = () => {
    router.push('/login')
  }

  if (!email) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Erro</h2>
            <p className={styles.subtitle}>E-mail não fornecido.</p>
          </div>
          <button onClick={handleBackToSignup} className={styles.primaryButton}>
            Voltar ao Cadastro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Image
            src="/logo.png"
            alt="ComparAuto Logo"
            width={60}
            height={60}
            className={styles.logo}
          />
          <div className={styles.iconWrapper}>
            <Mail size={48} className={styles.mailIcon} />
          </div>
          <h2 className={styles.title}>Confirme seu e-mail</h2>
          <p className={styles.subtitle}>Enviamos um link de confirmação para:</p>
          <p className={styles.email}>{email}</p>
        </div>

        <div className={styles.content}>
          <div className={styles.instructions}>
            <div className={styles.step}>
              <CheckCircle size={20} className={styles.stepIcon} />
              <span>Abra seu e-mail</span>
            </div>
            <div className={styles.step}>
              <CheckCircle size={20} className={styles.stepIcon} />
              <span>Procure por um e-mail do ComparAuto</span>
            </div>
            <div className={styles.step}>
              <CheckCircle size={20} className={styles.stepIcon} />
              <span>Clique no link &quot;Confirm your mail&quot;</span>
            </div>
          </div>

          <div className={styles.note}>
            <p>
              <strong>Não encontrou o e-mail?</strong> Verifique sua caixa de spam ou lixo
              eletrônico.
            </p>
          </div>

          {resendMessage && (
            <div
              className={`${styles.message} ${resendMessage.includes('sucesso') ? styles.success : styles.error}`}
            >
              {resendMessage}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            onClick={handleResendEmail}
            disabled={isResending || resendCooldown > 0}
            className={styles.secondaryButton}
          >
            {isResending ? (
              <>
                <RefreshCw size={16} className={styles.spinning} />
                Reenviando...
              </>
            ) : resendCooldown > 0 ? (
              `Reenviar em ${resendCooldown}s`
            ) : (
              'Reenviar e-mail'
            )}
          </button>

          <button onClick={handleGoToLogin} className={styles.primaryButton}>
            Já confirmei, fazer login
          </button>

          <button onClick={handleBackToSignup} className={styles.textButton}>
            <ArrowLeft size={16} />
            Voltar ao cadastro
          </button>
        </div>
      </div>{' '}
    </div>
  )
}

function LoadingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Carregando...</h2>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ConfirmEmailContent />
    </Suspense>
  )
}
