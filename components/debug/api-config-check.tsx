"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ConfigStatus {
  supabaseUrl: string | undefined
  supabaseAnonKey: string | undefined
  connectionTest: boolean
  authTest: boolean
  databaseTest: boolean
  error?: string
}

export function ApiConfigCheck() {
  const [status, setStatus] = useState<ConfigStatus>({
    supabaseUrl: undefined,
    supabaseAnonKey: undefined,
    connectionTest: false,
    authTest: false,
    databaseTest: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        // Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        console.log("🔍 Verificando configuração da API...")
        console.log("Supabase URL:", supabaseUrl ? "✅ Configurada" : "❌ Não configurada")
        console.log("Supabase Anon Key:", supabaseAnonKey ? "✅ Configurada" : "❌ Não configurada")

        const supabase = createClient()

        // Test basic connection
        let connectionTest = false
        let authTest = false
        let databaseTest = false
        let error = ""

        try {
          // Test connection to Supabase
          const { data, error: connectionError } = await supabase
            .from("customers")
            .select("count", { count: "exact", head: true })

          if (!connectionError) {
            connectionTest = true
            console.log("✅ Conexão com Supabase estabelecida")

            // Test database access
            databaseTest = true
            console.log("✅ Acesso ao banco de dados funcionando")
            console.log("📊 Total de clientes:", data)
          } else {
            console.error("❌ Erro na conexão:", connectionError)
            error = connectionError.message
          }
        } catch (err) {
          console.error("❌ Erro na conexão:", err)
          error = err instanceof Error ? err.message : "Erro desconhecido"
        }

        try {
          // Test auth
          const { data: authData, error: authError } = await supabase.auth.getSession()
          if (!authError) {
            authTest = true
            console.log("✅ Sistema de autenticação funcionando")
            console.log("👤 Usuário atual:", authData.session?.user?.email || "Não logado")
          } else {
            console.error("❌ Erro na autenticação:", authError)
          }
        } catch (err) {
          console.error("❌ Erro na autenticação:", err)
        }

        setStatus({
          supabaseUrl,
          supabaseAnonKey,
          connectionTest,
          authTest,
          databaseTest,
          error,
        })
      } catch (err) {
        console.error("❌ Erro geral:", err)
        setStatus({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          connectionTest: false,
          authTest: false,
          databaseTest: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      } finally {
        setLoading(false)
      }
    }

    checkConfiguration()
  }, [])

  const StatusIcon = ({ success }: { success: boolean }) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />
  }

  const StatusBadge = ({ success, label }: { success: boolean; label: string }) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="flex items-center gap-2">
        <StatusIcon success={success} />
        {label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Verificando Configuração da API
          </CardTitle>
          <CardDescription>Testando conexão com Supabase...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Status da Configuração da API
        </CardTitle>
        <CardDescription>Verificação da conexão com Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">URL do Supabase:</span>
            <StatusBadge
              success={!!status.supabaseUrl}
              label={status.supabaseUrl ? "Configurada" : "Não configurada"}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Chave Anônima:</span>
            <StatusBadge
              success={!!status.supabaseAnonKey}
              label={status.supabaseAnonKey ? "Configurada" : "Não configurada"}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Conexão com Supabase:</span>
            <StatusBadge
              success={status.connectionTest}
              label={status.connectionTest ? "Conectado" : "Falha na conexão"}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Sistema de Autenticação:</span>
            <StatusBadge success={status.authTest} label={status.authTest ? "Funcionando" : "Com problemas"} />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Acesso ao Banco:</span>
            <StatusBadge success={status.databaseTest} label={status.databaseTest ? "Funcionando" : "Com problemas"} />
          </div>
        </div>

        {status.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="font-medium text-red-800 mb-2">Erro detectado:</h4>
            <p className="text-sm text-red-700">{status.error}</p>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Informações de Debug:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              <strong>URL:</strong> {status.supabaseUrl || "Não configurada"}
            </p>
            <p>
              <strong>Chave:</strong>{" "}
              {status.supabaseAnonKey ? `${status.supabaseAnonKey.substring(0, 20)}...` : "Não configurada"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
