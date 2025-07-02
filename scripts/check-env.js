#!/usr/bin/env node
// Script para verificar variáveis de ambiente

// Carregar variáveis do .env.local
require('dotenv').config({ path: '.env.local' })

console.log('=== Verificação de Variáveis de Ambiente ===\n')

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

const optionalVars = [
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
]

console.log('Variáveis Obrigatórias:')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  console.log(`  ${varName}: ${value ? '✅ Configurada' : '❌ Faltando'}`)
  if (value) {
    console.log(`    Valor: ${value.substring(0, 20)}...`)
  }
})

console.log('\nVariáveis Opcionais:')
optionalVars.forEach(varName => {
  const value = process.env[varName]
  console.log(`  ${varName}: ${value ? '✅ Configurada' : '⚠️ Não configurada'}`)
})

console.log('\nPara corrigir problemas:')
console.log('1. Certifique-se de que o arquivo .env.local existe')
console.log('2. Reinicie o servidor de desenvolvimento (npm run dev)')
console.log('3. Verifique se as variáveis começam com NEXT_PUBLIC_ para uso no cliente')
