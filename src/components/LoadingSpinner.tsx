import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = "md", 
  className = "", 
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-label="Carregando">
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-blue-600`} 
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <LoadingSpinner 
        size="xl" 
        text="Carregando..." 
        className="text-center"
      />
    </div>
  )
}
