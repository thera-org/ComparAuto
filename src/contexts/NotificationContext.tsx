'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
}

interface NotificationContextValue {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  // Funções de conveniência
  success: (title: string, message?: string, duration?: number) => void
  error: (title: string, message?: string, duration?: number) => void
  warning: (title: string, message?: string, duration?: number) => void
  info: (title: string, message?: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // 5 segundos por padrão
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto remove notification após o tempo especificado
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, newNotification.duration)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Funções de conveniência
  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: 'success', title, message, duration })
    },
    [addNotification]
  )

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: 'error', title, message, duration: duration ?? 7000 }) // Erros ficam mais tempo
    },
    [addNotification]
  )

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: 'warning', title, message, duration })
    },
    [addNotification]
  )

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: 'info', title, message, duration })
    },
    [addNotification]
  )

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
