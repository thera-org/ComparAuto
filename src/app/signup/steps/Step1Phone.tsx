'use client'

import Image from 'next/image'

import { formatPhone } from '@/lib/validations'

import type { StepProps } from '../_types'

export function Step1Phone({ formData, onChange, onNext }: StepProps) {
  const isValid = formData.telefone.replace(/\D/g, '').length === 11

  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Vamos começar!</h1>
        <p className="text-gray-500">Digite seu número de telefone</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefone</label>
        <input
          type="tel"
          value={formData.telefone}
          onChange={e => onChange({ telefone: formatPhone(e.target.value) })}
          placeholder="(11) 99999-9999"
          maxLength={15}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!isValid}
        className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
      >
        Continuar
      </button>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200"></div>
        <span className="text-sm text-gray-500">ou cadastre-se com</span>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 font-medium transition hover:bg-gray-50"
        >
          <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
          <span className="text-gray-700">Continuar com Google</span>
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-3 font-medium text-white transition hover:bg-[#166FE5]"
        >
          <span className="material-icons">facebook</span>
          <span>Continuar com Facebook</span>
        </button>
      </div>
    </div>
  )
}
