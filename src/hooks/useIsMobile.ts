// Hook para detectar se está em mobile
import { useEffect, useState } from 'react'

/**
 * Hook que retorna true se a tela for mobile (largura < 768px)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}
