"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/contexts/toast-context"

interface DashboardStats {
  totalCustomers: number
  totalMotorcycles: number
  pendingBudgets: number
  monthlyRevenue: number
  lowStockParts: number
  activeServiceOrders: number
  overduePayments: number
  completedServicesThisMonth: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalMotorcycles: 0,
    pendingBudgets: 0,
    monthlyRevenue: 0,
    lowStockParts: 0,
    activeServiceOrders: 0,
    overduePayments: 0,
    completedServicesThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { error: showError } = useToast()

  const fetchSingleStat = async (
    supabase: any,
    tableName: string,
    statName: string,
    query?: any,
  ): Promise<{ name: string; value: number; error?: string }> => {
    try {
      let queryBuilder = supabase.from(tableName).select("id", { count: "exact", head: true })

      if (query) {
        queryBuilder = query(queryBuilder)
      }

      const { count, error } = await queryBuilder

      if (error) {
        console.error(`❌ Erro na consulta ${statName}:`, error.message)
        return { name: statName, value: 0, error: error.message }
      }

      console.log(`✅ ${statName}:`, count || 0)
      return { name: statName, value: count || 0 }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      console.error(`❌ Erro na consulta ${statName}:`, errorMessage)
      return { name: statName, value: 0, error: errorMessage }
    }
  }

  const fetchPaymentsStat = async (supabase: any): Promise<{ name: string; value: number; error?: string }> => {
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from("payments")
        .select("amount")
        .gte("payment_date", monthStart.toISOString().split("T")[0])
        .lte("payment_date", monthEnd.toISOString().split("T")[0])

      if (error) {
        console.error("❌ Erro na consulta de receita mensal:", error.message)
        return { name: "Receita Mensal", value: 0, error: error.message }
      }

      const monthlyRevenue = data?.reduce((sum, payment) => sum + Number.parseFloat(payment.amount), 0) || 0
      console.log("✅ Receita Mensal:", monthlyRevenue)
      return { name: "Receita Mensal", value: monthlyRevenue }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      console.error("❌ Erro na consulta de receita mensal:", errorMessage)
      return { name: "Receita Mensal", value: 0, error: errorMessage }
    }
  }

  const fetchLowStockParts = async (supabase: any): Promise<{ name: string; value: number; error?: string }> => {
    try {
      // Buscar todas as peças e filtrar no cliente
      const { data, error } = await supabase.from("parts").select("stock_quantity, min_stock_level")

      if (error) {
        console.error("❌ Erro na consulta de peças em baixo estoque:", error.message)
        return { name: "Peças em Baixo Estoque", value: 0, error: error.message }
      }

      // Filtrar peças com estoque baixo no lado do cliente
      const lowStockCount = data?.filter((part: any) => part.stock_quantity <= part.min_stock_level).length || 0

      console.log("✅ Peças em Baixo Estoque:", lowStockCount)
      return { name: "Peças em Baixo Estoque", value: lowStockCount }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      console.error("❌ Erro na consulta de peças em baixo estoque:", errorMessage)
      return { name: "Peças em Baixo Estoque", value: 0, error: errorMessage }
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Carregando estatísticas do dashboard...")

      const supabase = createClient()

      // Test basic connection first
      try {
        const { error: connectionError } = await supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .limit(1)

        if (connectionError) {
          throw new Error(`Erro de conexão: ${connectionError.message}`)
        }
      } catch (err) {
        throw new Error(
          `Falha na conexão com o banco de dados: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
        )
      }

      // Get current month dates for date-based queries
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      // Fetch stats individually with error handling
      const results = await Promise.allSettled([
        // Total customers
        fetchSingleStat(supabase, "customers", "Total de Clientes"),

        // Total motorcycles
        fetchSingleStat(supabase, "motorcycles", "Total de Motos"),

        // Pending budgets
        fetchSingleStat(supabase, "budgets", "Orçamentos Pendentes", (query: any) => query.eq("status", "pending")),

        // Monthly revenue
        fetchPaymentsStat(supabase),

        // Low stock parts - CORRIGIDO
        fetchLowStockParts(supabase),

        // Active service orders
        fetchSingleStat(supabase, "service_orders", "Ordens de Serviço Ativas", (query: any) =>
          query.in("status", ["open", "in_progress", "waiting_parts"]),
        ),

        // Overdue accounts payable
        fetchSingleStat(supabase, "accounts_payable", "Pagamentos em Atraso", (query: any) =>
          query.eq("status", "pending").lt("due_date", new Date().toISOString().split("T")[0]),
        ),

        // Completed services this month
        fetchSingleStat(supabase, "service_orders", "Serviços Concluídos", (query: any) =>
          query
            .eq("status", "completed")
            .gte("completion_date", monthStart.toISOString().split("T")[0])
            .lte("completion_date", monthEnd.toISOString().split("T")[0]),
        ),
      ])

      // Process results
      const newStats: DashboardStats = {
        totalCustomers: 0,
        totalMotorcycles: 0,
        pendingBudgets: 0,
        monthlyRevenue: 0,
        lowStockParts: 0,
        activeServiceOrders: 0,
        overduePayments: 0,
        completedServicesThisMonth: 0,
      }

      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const { name, value, error } = result.value

          if (error) {
            errors.push(`${name}: ${error}`)
          }

          // Map results to stats object
          switch (index) {
            case 0:
              newStats.totalCustomers = value
              break
            case 1:
              newStats.totalMotorcycles = value
              break
            case 2:
              newStats.pendingBudgets = value
              break
            case 3:
              newStats.monthlyRevenue = value
              break
            case 4:
              newStats.lowStockParts = value
              break
            case 5:
              newStats.activeServiceOrders = value
              break
            case 6:
              newStats.overduePayments = value
              break
            case 7:
              newStats.completedServicesThisMonth = value
              break
          }
        } else {
          errors.push(`Erro na consulta ${index + 1}: ${result.reason}`)
        }
      })

      console.log("✅ Estatísticas carregadas:", newStats)
      setStats(newStats)

      // Show warnings for errors but don't fail completely
      if (errors.length > 0) {
        console.warn("⚠️ Alguns dados não puderam ser carregados:", errors)
        setError(`Alguns dados não puderam ser carregados: ${errors.join(", ")}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard stats"
      console.error("❌ Erro ao carregar estatísticas:", errorMessage)
      setError(errorMessage)
      showError("Erro", errorMessage)

      // Set default stats on error
      setStats({
        totalCustomers: 0,
        totalMotorcycles: 0,
        pendingBudgets: 0,
        monthlyRevenue: 0,
        lowStockParts: 0,
        activeServiceOrders: 0,
        overduePayments: 0,
        completedServicesThisMonth: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
