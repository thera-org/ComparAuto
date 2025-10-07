'use client'

import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  useNotifications,
  type Notification,
  type NotificationType,
} from '@/contexts/NotificationContext'

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { removeNotification } = useNotifications()

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTitleColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  const getMessageColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div
      className={`animate-in slide-in-from-right-full relative rounded-lg border p-4 shadow-lg duration-300 ${getBackgroundColor(
        notification.type
      )}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{getIcon(notification.type)}</div>
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold ${getTitleColor(notification.type)}`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={`mt-1 text-sm ${getMessageColor(notification.type)}`}>
              {notification.message}
            </p>
          )}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant === 'primary' ? 'default' : 'outline'}
                  onClick={action.onClick}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => removeNotification(notification.id)}
          className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export const NotificationContainer: React.FC = () => {
  const { notifications } = useNotifications()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm space-y-2">
      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
