'use client'

import { useState } from 'react'

import type { StepProps } from '../_types'

export function Step3BasicInfo({ formData, onChange, onNext, onPrev }: StepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordMismatch =
    Boolean(formData.confirmPassword) && formData.password !== formData.confirmPassword

  const isValid =
    formData.nome !== '' &&
    formData.email !== '' &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword

  return (
    <div className="space-y-5">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Dados básicos</h1>
        <p className="text-gray-500">Informe seus dados para criar a conta</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Nome completo *</label>
        <input
          type="text"
          value={formData.nome}
          onChange={e => onChange({ nome: e.target.value })}
          placeholder="Seu nome"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">E-mail *</label>
        <input
          type="email"
          value={formData.email}
          onChange={e => onChange({ email: e.target.value })}
          placeholder="seu@email.com"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Senha *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => onChange({ password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <span className="material-icons-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirmar *</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={e => onChange({ confirmPassword: e.target.value })}
              placeholder="Confirme a senha"
              className={`w-full rounded-xl border bg-white px-4 py-3 pr-10 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                passwordMismatch ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <span className="material-icons-outlined text-xl">
                {showConfirmPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {passwordMismatch && <p className="mt-1 text-xs text-red-500">Senhas não coincidem</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <span className="material-icons text-sm">arrow_back</span> Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
