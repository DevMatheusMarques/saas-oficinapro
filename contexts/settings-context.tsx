"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
}

interface SystemSettings {
  autoSave: boolean
  backupEnabled: boolean
  auditLogs: boolean
  maintenanceMode: boolean
}

interface NotificationSettings {
  newCustomers: boolean
  lowStock: boolean
  pendingBudgets: boolean
  overdueBills: boolean
  weeklyReports: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  emailNotifications: boolean
  autoLogout: boolean
}

interface UserProfile {
  fullName: string
  email: string
  phone: string
  role: string
}

interface SettingsContextType {
  companySettings: CompanySettings
  systemSettings: SystemSettings
  notificationSettings: NotificationSettings
  securitySettings: SecuritySettings
  userProfile: UserProfile
  updateCompanySettings: (settings: Partial<CompanySettings>) => void
  updateSystemSettings: (settings: Partial<SystemSettings>) => void
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void
  updateUserProfile: (profile: Partial<UserProfile>) => void
  exportData: () => void
  clearCache: () => void
  createBackup: () => void
  resetSystem: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const defaultCompanySettings: CompanySettings = {
  name: "Mecânica do João",
  address: "Rua das Flores, 123, Centro",
  phone: "(11) 99999-9999",
  email: "contato@mecanica.com",
}

const defaultSystemSettings: SystemSettings = {
  autoSave: true,
  backupEnabled: true,
  auditLogs: true,
  maintenanceMode: false,
}

const defaultNotificationSettings: NotificationSettings = {
  newCustomers: true,
  lowStock: true,
  pendingBudgets: true,
  overdueBills: true,
  weeklyReports: false,
}

const defaultSecuritySettings: SecuritySettings = {
  twoFactorAuth: false,
  emailNotifications: true,
  autoLogout: true,
}

const defaultUserProfile: UserProfile = {
  fullName: "João Silva",
  email: "joao@email.com",
  phone: "(11) 99999-9999",
  role: "Gerente",
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings)
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedCompanySettings = localStorage.getItem("companySettings")
    const savedSystemSettings = localStorage.getItem("systemSettings")
    const savedNotificationSettings = localStorage.getItem("notificationSettings")
    const savedSecuritySettings = localStorage.getItem("securitySettings")
    const savedUserProfile = localStorage.getItem("userProfile")

    if (savedCompanySettings) {
      setCompanySettings(JSON.parse(savedCompanySettings))
    }
    if (savedSystemSettings) {
      setSystemSettings(JSON.parse(savedSystemSettings))
    }
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings))
    }
    if (savedSecuritySettings) {
      setSecuritySettings(JSON.parse(savedSecuritySettings))
    }
    if (savedUserProfile) {
      setUserProfile(JSON.parse(savedUserProfile))
    }
  }, [])

  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    const newSettings = { ...companySettings, ...settings }
    setCompanySettings(newSettings)
    localStorage.setItem("companySettings", JSON.stringify(newSettings))
  }

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    const newSettings = { ...systemSettings, ...settings }
    setSystemSettings(newSettings)
    localStorage.setItem("systemSettings", JSON.stringify(newSettings))
  }

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    const newSettings = { ...notificationSettings, ...settings }
    setNotificationSettings(newSettings)
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings))
  }

  const updateSecuritySettings = (settings: Partial<SecuritySettings>) => {
    const newSettings = { ...securitySettings, ...settings }
    setSecuritySettings(newSettings)
    localStorage.setItem("securitySettings", JSON.stringify(newSettings))
  }

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...profile }
    setUserProfile(newProfile)
    localStorage.setItem("userProfile", JSON.stringify(newProfile))
  }

  const exportData = () => {
    const data = {
      companySettings,
      systemSettings,
      notificationSettings,
      securitySettings,
      userProfile,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `saas-mecanica-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearCache = () => {
    // Clear browser cache
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }
    // Clear localStorage cache items
    const cacheKeys = Object.keys(localStorage).filter((key) => key.includes("cache"))
    cacheKeys.forEach((key) => localStorage.removeItem(key))

    alert("Cache limpo com sucesso!")
  }

  const createBackup = () => {
    exportData()
    alert("Backup criado e baixado com sucesso!")
  }

  const resetSystem = () => {
    if (confirm("Tem certeza que deseja resetar o sistema? Esta ação não pode ser desfeita.")) {
      localStorage.clear()
      setCompanySettings(defaultCompanySettings)
      setSystemSettings(defaultSystemSettings)
      setNotificationSettings(defaultNotificationSettings)
      setSecuritySettings(defaultSecuritySettings)
      setUserProfile(defaultUserProfile)
      alert("Sistema resetado com sucesso!")
      window.location.reload()
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        companySettings,
        systemSettings,
        notificationSettings,
        securitySettings,
        userProfile,
        updateCompanySettings,
        updateSystemSettings,
        updateNotificationSettings,
        updateSecuritySettings,
        updateUserProfile,
        exportData,
        clearCache,
        createBackup,
        resetSystem,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
