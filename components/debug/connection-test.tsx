"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runTests = async () => {
    setTesting(true)
    const supabase = createClient()
    const testResults: any = {}

    try {
      // Test 1: Basic connection
      console.log("🧪 Teste 1: Conexão básica")
      const { data: healthCheck, error: healthError } = await supabase
        .from("customers")
        .select("count", { count: "exact", head: true })

      testResults.connection = {
        success: !healthError,
        error: healthError?.message,
        data: healthCheck,
      }

      // Test 2: Read customers
      console.log("🧪 Teste 2: Leitura de clientes")
      const { data: customers, error: customersError } = await supabase.from("customers").select("*").limit(5)

      testResults.customers = {
        success: !customersError,
        error: customersError?.message,
        count: customers?.length || 0,
        data: customers,
      }

      // Test 3: Read parts
      console.log("🧪 Teste 3: Leitura de peças")
      const { data: parts, error: partsError } = await supabase.from("parts").select("*").limit(5)

      testResults.parts = {
        success: !partsError,
        error: partsError?.message,
        count: parts?.length || 0,
        data: parts,
      }

      // Test 4: Auth status
      console.log("🧪 Teste 4: Status da autenticação")
      const { data: authData, error: authError } = await supabase.auth.getSession()

      testResults.auth = {
        success: !authError,
        error: authError?.message,
        user: authData.session?.user?.email || null,
      }

      // Test 5: Environment variables
      console.log("🧪 Teste 5: Variáveis de ambiente")
      testResults.env = {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
      }

      console.log("✅ Todos os testes concluídos:", testResults)
      setResults(testResults)
    } catch (error) {
      console.error("❌ Erro durante os testes:", error)
      setResults({ error: error instanceof Error ? error.message : "Erro desconhecido" })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Conexão Detalhado</CardTitle>
        <CardDescription>Execute testes manuais da API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing}>
          {testing ? "Executando testes..." : "Executar Testes"}
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {results.connection && (
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Conexão Básica:</span>
                  <Badge variant={results.connection.success ? "default" : "destructive"}>
                    {results.connection.success ? "✅ Sucesso" : "❌ Falha"}
                  </Badge>
                </div>
              )}

              {results.customers && (
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Leitura de Clientes:</span>
                  <Badge variant={results.customers.success ? "default" : "destructive"}>
                    {results.customers.success ? `✅ ${results.customers.count} clientes` : "❌ Falha"}
                  </Badge>
                </div>
              )}

              {results.parts && (
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Leitura de Peças:</span>
                  <Badge variant={results.parts.success ? "default" : "destructive"}>
                    {results.parts.success ? `✅ ${results.parts.count} peças` : "❌ Falha"}
                  </Badge>
                </div>
              )}

              {results.auth && (
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Autenticação:</span>
                  <Badge variant={results.auth.success ? "default" : "destructive"}>
                    {results.auth.success ? `✅ ${results.auth.user || "Não logado"}` : "❌ Falha"}
                  </Badge>
                </div>
              )}

              {results.env && (
                <div className="p-3 border rounded space-y-2">
                  <h4 className="font-medium">Variáveis de Ambiente:</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      URL: {results.env.supabaseUrl ? "✅" : "❌"} {results.env.urlValue}
                    </div>
                    <div>
                      Key: {results.env.supabaseKey ? "✅" : "❌"} {results.env.keyValue}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {results.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h4 className="font-medium text-red-800">Erro:</h4>
                <p className="text-sm text-red-700">{results.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
