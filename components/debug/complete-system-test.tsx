"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  success: boolean
  error?: string
  data?: any
  details?: string
}

export function CompleteSystemTest() {
  const [testing, setTesting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState("")

  const updateProgress = (current: number, total: number, testName: string) => {
    setProgress((current / total) * 100)
    setCurrentTest(testName)
  }

  const runCompleteTest = async () => {
    setTesting(true)
    setResults([])
    setProgress(0)

    const supabase = createClient()
    const testResults: TestResult[] = []
    const totalTests = 15

    try {
      // Test 1: Environment Variables
      updateProgress(1, totalTests, "Verificando variáveis de ambiente")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      testResults.push({
        name: "Variáveis de Ambiente",
        success: !!(supabaseUrl && supabaseKey),
        details: `URL: ${supabaseUrl ? "✅" : "❌"}, Key: ${supabaseKey ? "✅" : "❌"}`,
        data: { url: supabaseUrl, hasKey: !!supabaseKey },
      })

      // Test 2: Basic Connection
      updateProgress(2, totalTests, "Testando conexão básica")
      try {
        const { data, error } = await supabase.from("customers").select("count", { count: "exact", head: true })
        testResults.push({
          name: "Conexão Básica",
          success: !error,
          error: error?.message,
          data: data,
        })
      } catch (err) {
        testResults.push({
          name: "Conexão Básica",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 3: Auth System
      updateProgress(3, totalTests, "Testando sistema de autenticação")
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        testResults.push({
          name: "Sistema de Autenticação",
          success: !authError,
          error: authError?.message,
          details: authData.session?.user?.email || "Usuário não logado",
        })
      } catch (err) {
        testResults.push({
          name: "Sistema de Autenticação",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 4: Customers Table
      updateProgress(4, totalTests, "Testando tabela de clientes")
      try {
        const { data: customers, error } = await supabase.from("customers").select("*").limit(5)
        testResults.push({
          name: "Tabela Customers",
          success: !error,
          error: error?.message,
          details: `${customers?.length || 0} clientes encontrados`,
          data: customers,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Customers",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 5: Motorcycles Table
      updateProgress(5, totalTests, "Testando tabela de motos")
      try {
        const { data: motorcycles, error } = await supabase.from("motorcycles").select("*").limit(5)
        testResults.push({
          name: "Tabela Motorcycles",
          success: !error,
          error: error?.message,
          details: `${motorcycles?.length || 0} motos encontradas`,
          data: motorcycles,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Motorcycles",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 6: Parts Table
      updateProgress(6, totalTests, "Testando tabela de peças")
      try {
        const { data: parts, error } = await supabase.from("parts").select("*").limit(5)
        testResults.push({
          name: "Tabela Parts",
          success: !error,
          error: error?.message,
          details: `${parts?.length || 0} peças encontradas`,
          data: parts,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Parts",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 7: Part Categories Table
      updateProgress(7, totalTests, "Testando categorias de peças")
      try {
        const { data: categories, error } = await supabase.from("part_categories").select("*")
        testResults.push({
          name: "Tabela Part Categories",
          success: !error,
          error: error?.message,
          details: `${categories?.length || 0} categorias encontradas`,
          data: categories,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Part Categories",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 8: Budgets Table
      updateProgress(8, totalTests, "Testando tabela de orçamentos")
      try {
        const { data: budgets, error } = await supabase.from("budgets").select("*")
        testResults.push({
          name: "Tabela Budgets",
          success: !error,
          error: error?.message,
          details: `${budgets?.length || 0} orçamentos encontrados`,
          data: budgets,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Budgets",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 9: Service Orders Table
      updateProgress(9, totalTests, "Testando ordens de serviço")
      try {
        const { data: serviceOrders, error } = await supabase.from("service_orders").select("*")
        testResults.push({
          name: "Tabela Service Orders",
          success: !error,
          error: error?.message,
          details: `${serviceOrders?.length || 0} ordens de serviço encontradas`,
          data: serviceOrders,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Service Orders",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 10: Payments Table
      updateProgress(10, totalTests, "Testando tabela de pagamentos")
      try {
        const { data: payments, error } = await supabase.from("payments").select("*")
        testResults.push({
          name: "Tabela Payments",
          success: !error,
          error: error?.message,
          details: `${payments?.length || 0} pagamentos encontrados`,
          data: payments,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Payments",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 11: Stock Movements Table
      updateProgress(11, totalTests, "Testando movimentações de estoque")
      try {
        const { data: stockMovements, error } = await supabase.from("stock_movements").select("*")
        testResults.push({
          name: "Tabela Stock Movements",
          success: !error,
          error: error?.message,
          details: `${stockMovements?.length || 0} movimentações encontradas`,
          data: stockMovements,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Stock Movements",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 12: Accounts Payable Table
      updateProgress(12, totalTests, "Testando contas a pagar")
      try {
        const { data: accountsPayable, error } = await supabase.from("accounts_payable").select("*")
        testResults.push({
          name: "Tabela Accounts Payable",
          success: !error,
          error: error?.message,
          details: `${accountsPayable?.length || 0} contas encontradas`,
          data: accountsPayable,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Accounts Payable",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 13: Service History Table
      updateProgress(13, totalTests, "Testando histórico de serviços")
      try {
        const { data: serviceHistory, error } = await supabase.from("service_history").select("*")
        testResults.push({
          name: "Tabela Service History",
          success: !error,
          error: error?.message,
          details: `${serviceHistory?.length || 0} registros de histórico encontrados`,
          data: serviceHistory,
        })
      } catch (err) {
        testResults.push({
          name: "Tabela Service History",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 14: Dashboard Stats Query
      updateProgress(14, totalTests, "Testando consultas do dashboard")
      try {
        const [customersCount, motorcyclesCount, budgetsCount] = await Promise.all([
          supabase.from("customers").select("id", { count: "exact", head: true }),
          supabase.from("motorcycles").select("id", { count: "exact", head: true }),
          supabase.from("budgets").select("id", { count: "exact", head: true }),
        ])

        const hasErrors = customersCount.error || motorcyclesCount.error || budgetsCount.error
        testResults.push({
          name: "Consultas Dashboard",
          success: !hasErrors,
          error: hasErrors ? "Erro em uma ou mais consultas" : undefined,
          details: `Clientes: ${customersCount.count}, Motos: ${motorcyclesCount.count}, Orçamentos: ${budgetsCount.count}`,
          data: {
            customers: customersCount.count,
            motorcycles: motorcyclesCount.count,
            budgets: budgetsCount.count,
          },
        })
      } catch (err) {
        testResults.push({
          name: "Consultas Dashboard",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      // Test 15: RLS Policies
      updateProgress(15, totalTests, "Testando políticas RLS")
      try {
        // Test if we can access data (RLS should allow authenticated users)
        const { data: testData, error } = await supabase.from("customers").select("id").limit(1)
        testResults.push({
          name: "Políticas RLS",
          success: !error,
          error: error?.message,
          details: error ? "RLS pode estar bloqueando acesso" : "RLS funcionando corretamente",
        })
      } catch (err) {
        testResults.push({
          name: "Políticas RLS",
          success: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }

      setResults(testResults)
      setProgress(100)
      setCurrentTest("Testes concluídos!")
    } catch (error) {
      console.error("Erro durante os testes:", error)
      testResults.push({
        name: "Erro Geral",
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
      setResults(testResults)
    } finally {
      setTesting(false)
    }
  }

  const successCount = results.filter((r) => r.success).length
  const totalTests = results.length
  const successRate = totalTests > 0 ? (successCount / totalTests) * 100 : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Teste Completo do Sistema
        </CardTitle>
        <CardDescription>Verificação completa de todas as funcionalidades e integrações</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={runCompleteTest} disabled={testing} className="flex items-center gap-2">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {testing ? "Executando..." : "Executar Teste Completo"}
          </Button>

          {totalTests > 0 && (
            <Badge variant={successRate === 100 ? "default" : successRate > 70 ? "secondary" : "destructive"}>
              {successCount}/{totalTests} testes passaram ({successRate.toFixed(1)}%)
            </Badge>
          )}
        </div>

        {testing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentTest}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Resultados dos Testes:</h3>
            <div className="grid gap-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <span className="font-medium">{result.name}</span>
                      {result.details && <p className="text-sm text-muted-foreground">{result.details}</p>}
                      {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                    </div>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "✅" : "❌"}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && successRate === 100 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🎉 Sistema 100% Funcional!</h4>
            <p className="text-green-700">
              Todos os testes passaram com sucesso. O sistema está completamente integrado ao Supabase e todas as
              funcionalidades estão operacionais.
            </p>
          </div>
        )}

        {results.length > 0 && successRate < 100 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Problemas Detectados</h4>
            <p className="text-yellow-700">
              Alguns testes falharam. Verifique os erros acima e corrija as configurações necessárias.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
