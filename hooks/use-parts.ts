"use client"

import { useState, useEffect } from "react"
import type { Part, PartCategory, CreatePartData, UpdatePartData } from "@/domain/entities/part"
import { PartUseCases } from "@/domain/use-cases/part-use-cases"
import { SupabasePartRepository } from "@/infrastructure/repositories/supabase-part-repository"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/contexts/toast-context"

export function useParts() {
  const [parts, setParts] = useState<Part[]>([])
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const supabase = createClient()
  const partRepository = new SupabasePartRepository(supabase)
  const partUseCases = new PartUseCases(partRepository)

  const fetchParts = async () => {
    try {
      setLoading(true)
      setError(null)
      const [partsData, categoriesData] = await Promise.all([
        partUseCases.getAllParts(),
        partUseCases.getAllCategories(),
      ])
      setParts(partsData)
      setCategories(categoriesData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch parts"
      setError(errorMessage)
      showError("Erro", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createPart = async (data: CreatePartData): Promise<Part | null> => {
    try {
      const part = await partUseCases.createPart(data)
      setParts((prev) => [part, ...prev])
      success("Sucesso", "Peça criada com sucesso!")
      return part
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create part"
      showError("Erro", errorMessage)
      return null
    }
  }

  const updatePart = async (data: UpdatePartData): Promise<Part | null> => {
    try {
      const part = await partUseCases.updatePart(data)
      setParts((prev) => prev.map((p) => (p.id === part.id ? part : p)))
      success("Sucesso", "Peça atualizada com sucesso!")
      return part
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update part"
      showError("Erro", errorMessage)
      return null
    }
  }

  const deletePart = async (id: string): Promise<boolean> => {
    try {
      await partUseCases.deletePart(id)
      setParts((prev) => prev.filter((p) => p.id !== id))
      success("Sucesso", "Peça excluída com sucesso!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete part"
      showError("Erro", errorMessage)
      return false
    }
  }

  const adjustStock = async (partId: string, quantity: number, reason: string): Promise<boolean> => {
    try {
      await partUseCases.adjustStock(partId, quantity, reason)
      // Refresh parts to get updated stock
      await fetchParts()
      success("Sucesso", "Estoque ajustado com sucesso!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to adjust stock"
      showError("Erro", errorMessage)
      return false
    }
  }

  const createCategory = async (name: string, description?: string): Promise<PartCategory | null> => {
    try {
      const category = await partUseCases.createCategory(name, description)
      setCategories((prev) => [...prev, category])
      success("Sucesso", "Categoria criada com sucesso!")
      return category
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create category"
      showError("Erro", errorMessage)
      return null
    }
  }

  const getLowStockParts = async (): Promise<Part[]> => {
    try {
      return await partUseCases.getLowStockParts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get low stock parts"
      showError("Erro", errorMessage)
      return []
    }
  }

  useEffect(() => {
    fetchParts()
  }, [])

  return {
    parts,
    categories,
    loading,
    error,
    createPart,
    updatePart,
    deletePart,
    adjustStock,
    createCategory,
    getLowStockParts,
    refetch: fetchParts,
  }
}
