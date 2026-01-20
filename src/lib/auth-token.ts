// src/lib/auth-token.ts
/**
 * Gerenciamento centralizado de tokens de autenticação
 * Persiste o ID token do usuário em localStorage
 */

// Constantes para as chaves de storage
export const AUTH_STORAGE_KEYS = {
  ID_TOKEN: 'comparauto_id_token',
  ACCESS_TOKEN: 'comparauto_access_token',
  REFRESH_TOKEN: 'comparauto_refresh_token',
  USER_ID: 'comparauto_user_id',
  USER_EMAIL: 'comparauto_user_email',
  USER_DATA: 'comparauto_user_data',
} as const

export interface StoredUserData {
  id: string
  email: string
  name?: string
  role?: string
}

/**
 * Verifica se estamos no ambiente do navegador
 */
const isBrowser = (): boolean => typeof window !== 'undefined'

/**
 * Salva o ID token no localStorage
 */
export const saveIdToken = (token: string): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.ID_TOKEN, token)
  } catch (error) {
    console.error('Erro ao salvar ID token:', error)
  }
}

/**
 * Recupera o ID token do localStorage
 */
export const getIdToken = (): string | null => {
  if (!isBrowser()) return null
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ID_TOKEN)
  } catch (error) {
    console.error('Erro ao recuperar ID token:', error)
    return null
  }
}

/**
 * Salva o access token no localStorage
 */
export const saveAccessToken = (token: string): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token)
  } catch (error) {
    console.error('Erro ao salvar access token:', error)
  }
}

/**
 * Recupera o access token do localStorage
 */
export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
  } catch (error) {
    console.error('Erro ao recuperar access token:', error)
    return null
  }
}

/**
 * Salva o refresh token no localStorage
 */
export const saveRefreshToken = (token: string): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token)
  } catch (error) {
    console.error('Erro ao salvar refresh token:', error)
  }
}

/**
 * Recupera o refresh token do localStorage
 */
export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  } catch (error) {
    console.error('Erro ao recuperar refresh token:', error)
    return null
  }
}

/**
 * Salva os dados do usuário no localStorage
 */
export const saveUserData = (userData: StoredUserData): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, userData.id)
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_EMAIL, userData.email)
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error)
  }
}

/**
 * Recupera os dados do usuário do localStorage
 */
export const getUserData = (): StoredUserData | null => {
  if (!isBrowser()) return null
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Erro ao recuperar dados do usuário:', error)
    return null
  }
}

/**
 * Recupera o ID do usuário do localStorage
 */
export const getUserId = (): string | null => {
  if (!isBrowser()) return null
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID)
  } catch (error) {
    console.error('Erro ao recuperar ID do usuário:', error)
    return null
  }
}

/**
 * Salva todos os tokens da sessão
 */
export const saveSessionTokens = (session: {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email?: string
    user_metadata?: { name?: string; full_name?: string }
  }
}): void => {
  saveAccessToken(session.access_token)
  saveRefreshToken(session.refresh_token)
  // O Supabase não retorna um ID token separado, usamos o access_token como identificador
  saveIdToken(session.access_token)
  saveUserData({
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
  })
}

/**
 * Remove todos os tokens de autenticação do localStorage
 */
export const clearAuthTokens = (): void => {
  if (!isBrowser()) return
  try {
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    // Limpar também os tokens legados
    localStorage.removeItem('admin')
    localStorage.removeItem('adminData')
  } catch (error) {
    console.error('Erro ao limpar tokens:', error)
  }
}

/**
 * Verifica se há tokens válidos armazenados
 */
export const hasStoredTokens = (): boolean => {
  return !!getAccessToken() && !!getUserId()
}
