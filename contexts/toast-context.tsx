"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastMessage {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, "id">) => void
  removeToast: (id: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "success", title, description })
    },
    [addToast],
  )

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "error", title, description })
    },
    [addToast],
  )

  const warning = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "warning", title, description })
    },
    [addToast],
  )

  const info = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "info", title, description })
    },
    [addToast],
  )

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
            "animate-in slide-in-from-top-2 duration-300",
            {
              "border-green-500 bg-green-50 text-green-900": toast.type === "success",
              "border-red-500 bg-red-50 text-red-900": toast.type === "error",
              "border-yellow-500 bg-yellow-50 text-yellow-900": toast.type === "warning",
              "border-blue-500 bg-blue-50 text-blue-900": toast.type === "info",
            },
          )}
        >
          <div className="flex-1">
            <div className="font-semibold text-sm">{toast.title}</div>
            {toast.description && <div className="text-sm opacity-90 mt-1">{toast.description}</div>}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
