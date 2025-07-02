/**
 * Utility functions for form validation
 */

// Validação de CPF
export const validateCPF = (cpf: string): boolean => {
  // Remove pontos e traços
  const cleanCPF = cpf.replace(/[^\d]/g, '')
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleanCPF.charAt(9))) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleanCPF.charAt(10))) return false
  
  return true
}

// Validação de CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '')
  
  if (cleanCNPJ.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false
  
  // Validação dos dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i]
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(cleanCNPJ.charAt(12))) return false
  
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i]
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(cleanCNPJ.charAt(13))) return false
  
  return true
}

// Validação de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de telefone brasileiro
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^\d]/g, '')
  return cleanPhone.length === 10 || cleanPhone.length === 11
}

// Validação de CEP
export const validateCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/[^\d]/g, '')
  return cleanCEP.length === 8
}

// Formatação de CPF
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/[^\d]/g, '')
  if (cleanCPF.length <= 11) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return cpf
}

// Formatação de CNPJ
export const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '')
  if (cleanCNPJ.length <= 14) {
    return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return cnpj
}

// Formatação de telefone
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[^\d]/g, '')
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// Formatação de CEP
export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/[^\d]/g, '')
  if (cleanCEP.length <= 8) {
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2')
  }
  return cep
}

// Validação de senha forte
export const validatePassword = (password: string): boolean => {
  // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Validação de URL
export const validateURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Sanitização de string
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>\"']/g, '')
}

// Validação de horário (HH:mm)
export const validateTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

// Comparar horários
export const isTimeAfter = (time1: string, time2: string): boolean => {
  const [hours1, minutes1] = time1.split(':').map(Number)
  const [hours2, minutes2] = time2.split(':').map(Number)
  
  const totalMinutes1 = hours1 * 60 + minutes1
  const totalMinutes2 = hours2 * 60 + minutes2
  
  return totalMinutes1 > totalMinutes2
}
