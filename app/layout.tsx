import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ToastProvider } from "@/contexts/toast-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { SupabaseConfigError } from "@/components/error/supabase-config-error"
import { validateSupabaseConfig } from "@/lib/config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SaaS Mecânica Motos",
  description: "Sistema completo para gestão de mecânicas de motos",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Validate Supabase configuration
  const configValidation = validateSupabaseConfig()

  if (!configValidation.isValid) {
    return (
      <html lang="pt-BR">
        <body className={inter.className}>
          <SupabaseConfigError errors={configValidation.errors} />
        </body>
      </html>
    )
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SettingsProvider>
            <AuthProvider>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
