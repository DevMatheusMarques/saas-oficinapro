"use client"

import { useState, useEffect } from "react"
import type { Part, CreatePartData } from "@/domain/entities/part"
import { PartUseCases } from "@/domain/use-cases/part-use-cases"
import { SupabasePartRepository } from "@/infrastructure/repositories/supabase-part-repository"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/contexts/toast-context"

interface Category {
  id: string
  name: string
}

export function useParts() {
  const [parts, setParts] = useState<Part[]>([])
  const [categories, setCategories] = useState<Category[]>([])
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
      const data = await partUseCases.getAllParts()
      setParts(data)

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map((part) => part.category).filter(Boolean))).map(
        (name, index) => ({
          id: `cat-${index}`,
          name: name as string,
        }),
      )
      setCategories(uniqueCategories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch parts"
      setError(errorMessage)
      console.error("Error fetching parts:", err)
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
      console.error("Error creating part:", err)
      return null
    }
  }

  const updatePart = async (id: string, data: Partial<Part>): Promise<Part | null> => {
    try {
      const part = await partUseCases.updatePart(id, data)
      setParts((prev) => prev.map((p) => (p.id === part.id ? part : p)))
      success("Sucesso", "Peça atualizada com sucesso!")
      return part
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update part"
      showError("Erro", errorMessage)
      console.error("Error updating part:", err)
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
      console.error("Error deleting part:", err)
      return false
    }
  }

  const updatePartStock = async (id: string, newQuantity: number): Promise<boolean> => {
    try {
      await partUseCases.updatePart(id, { quantity: newQuantity })
      setParts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: newQuantity } : p)))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update stock"
      showError("Erro", errorMessage)
      console.error("Error updating stock:", err)
      return false
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
    updatePartStock,
    refetch: fetchParts,
  }
}
