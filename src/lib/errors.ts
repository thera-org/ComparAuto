export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export const ErrorCodes = {
  // Autenticação
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCESS_DENIED: 'ACCESS_DENIED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Dados
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Rede/Servidor
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Supabase específicos
  SUPABASE_CONNECTION_ERROR: 'SUPABASE_CONNECTION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
} as const

export function handleSupabaseError(error: unknown): AppError {
  if (!error) {
    return new AppError('Erro desconhecido', ErrorCodes.SERVER_ERROR)
  }

  // Type guard para verificar se é um erro com message
  const hasMessage = (err: unknown): err is { message: string } => {
    return typeof err === 'object' && err !== null && 'message' in err
  }

  // Type guard para verificar se é um erro com code
  const hasCode = (err: unknown): err is { code: string } => {
    return typeof err === 'object' && err !== null && 'code' in err
  }

  // Erros de conexão
  if (hasMessage(error) && error.message?.includes('fetch')) {
    return new AppError(
      'Erro de conexão. Verifique sua internet.',
      ErrorCodes.NETWORK_ERROR,
      503
    )
  }

  // Erros de autenticação
  if (hasMessage(error) && error.message?.includes('Invalid login credentials')) {
    return new AppError(
      'Email ou senha incorretos',
      ErrorCodes.INVALID_CREDENTIALS,
      401
    )
  }

  // Erros de permissão
  if (hasMessage(error) && (error.message?.includes('JWT expired') || error.message?.includes('invalid claim'))) {
    return new AppError(
      'Sessão expirada. Faça login novamente.',
      ErrorCodes.SESSION_EXPIRED,
      401
    )
  }

  // Erros de dados não encontrados
  if ((hasCode(error) && error.code === 'PGRST116') || (hasMessage(error) && error.message?.includes('not found'))) {
    return new AppError(
      'Dados não encontrados',
      ErrorCodes.NOT_FOUND,
      404
    )
  }

  // Erros de validação
  if ((hasCode(error) && error.code?.startsWith('23')) || (hasMessage(error) && error.message?.includes('duplicate'))) {
    return new AppError(
      'Dados duplicados ou inválidos',
      ErrorCodes.VALIDATION_ERROR,
      400
    )
  }

  // Erro genérico do Supabase
  const message = hasMessage(error) ? error.message : 'Erro no banco de dados'
  return new AppError(
    message,
    ErrorCodes.DATABASE_ERROR,
    500
  )
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'Ocorreu um erro inesperado'
}
