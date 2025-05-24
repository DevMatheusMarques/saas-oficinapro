"use client"

import { useState, useEffect } from "react"
import type { Budget, CreateBudgetData } from "@/domain/entities/budget"
import { BudgetUseCases } from "@/domain/use-cases/budget-use-cases"
import { SupabaseBudgetRepository } from "@/infrastructure/repositories/supabase-budget-repository"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/contexts/toast-context"

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const supabase = createClient()
  const budgetRepository = new SupabaseBudgetRepository(supabase)
  const budgetUseCases = new BudgetUseCases(budgetRepository)

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await budgetUseCases.getAllBudgets()
      setBudgets(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch budgets"
      setError(errorMessage)
      showError("Erro", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createBudget = async (data: CreateBudgetData): Promise<Budget | null> => {
    try {
      const budget = await budgetUseCases.createBudget(data)
      setBudgets((prev) => [budget, ...prev])
      success("Sucesso", "Orçamento criado com sucesso!")
      return budget
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create budget"
      showError("Erro", errorMessage)
      return null
    }
  }

  const updateBudget = async (id: string, data: Partial<Budget>): Promise<Budget | null> => {
    try {
      const budget = await budgetUseCases.updateBudget(id, data)
      setBudgets((prev) => prev.map((b) => (b.id === budget.id ? budget : b)))
      success("Sucesso", "Orçamento atualizado com sucesso!")
      return budget
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update budget"
      showError("Erro", errorMessage)
      return null
    }
  }

  const deleteBudget = async (id: string): Promise<boolean> => {
    try {
      await budgetUseCases.deleteBudget(id)
      setBudgets((prev) => prev.filter((b) => b.id !== id))
      success("Sucesso", "Orçamento excluído com sucesso!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete budget"
      showError("Erro", errorMessage)
      return false
    }
  }

  const approveBudget = async (id: string): Promise<boolean> => {
    try {
      await budgetUseCases.approveBudget(id)
      await fetchBudgets()
      success("Sucesso", "Orçamento aprovado com sucesso!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to approve budget"
      showError("Erro", errorMessage)
      return false
    }
  }

  const rejectBudget = async (id: string): Promise<boolean> => {
    try {
      await budgetUseCases.rejectBudget(id)
      await fetchBudgets()
      success("Sucesso", "Orçamento rejeitado!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reject budget"
      showError("Erro", errorMessage)
      return false
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    approveBudget,
    rejectBudget,
    refetch: fetchBudgets,
  }
}
