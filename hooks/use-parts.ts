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
      console.log("🔄 Carregando peças...")

      // Buscar peças com join das categorias
      const { data: partsData, error: partsError } = await supabase
        .from("parts")
        .select(`
          *,
          part_categories(name)
        `)
        .order("name")

      if (partsError) {
        throw new Error(`Failed to fetch parts: ${partsError.message}`)
      }

      // Mapear os dados corretamente
      const mappedParts: Part[] = partsData.map((data: any) => ({
        id: data.id,
        categoryId: data.category_id,
        name: data.name,
        description: data.description,
        partNumber: data.part_number,
        code: data.part_number || data.code,
        brand: data.brand,
        costPrice: Number.parseFloat(data.cost_price) || 0,
        cost_price: Number.parseFloat(data.cost_price) || 0,
        salePrice: Number.parseFloat(data.sale_price) || 0,
        sale_price: Number.parseFloat(data.sale_price) || 0,
        stockQuantity: data.stock_quantity || 0,
        quantity: data.stock_quantity || 0,
        minStockLevel: data.min_stock_level || 0,
        minimum_stock: data.min_stock_level || 0,
        location: data.location,
        unit: data.unit || "un",
        category: data.part_categories?.name || "Sem categoria",
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }))

      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("part_categories")
        .select("*")
        .order("name")

      if (categoriesError) {
        console.warn("Erro ao carregar categorias:", categoriesError.message)
      }

      const mappedCategories: PartCategory[] =
        categoriesData?.map((data: any) => ({
          id: data.id,
          name: data.name,
          description: data.description,
          createdAt: new Date(data.created_at),
        })) || []

      console.log("✅ Peças carregadas:", mappedParts.length)
      console.log("✅ Categorias carregadas:", mappedCategories.length)
      console.log("📊 Dados das peças:", mappedParts.slice(0, 2)) // Log das primeiras 2 peças para debug

      setParts(mappedParts)
      setCategories(mappedCategories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch parts"
      console.error("❌ Erro ao carregar peças:", errorMessage)
      setError(errorMessage)
      showError("Erro", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createPart = async (data: CreatePartData): Promise<Part | null> => {
    try {
      console.log("🔄 Criando peça:", data)
      const part = await partUseCases.createPart(data)
      setParts((prev) => [part, ...prev])
      success("Sucesso", "Peça criada com sucesso!")
      console.log("✅ Peça criada:", part)
      return part
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create part"
      console.error("❌ Erro ao criar peça:", errorMessage)
      showError("Erro", errorMessage)
      return null
    }
  }

  const updatePart = async (id: string, data: UpdatePartData): Promise<Part | null> => {
    try {
      console.log("🔄 Atualizando peça:", id, data)
      const part = await partUseCases.updatePart({ id, ...data })
      setParts((prev) => prev.map((p) => (p.id === part.id ? part : p)))
      success("Sucesso", "Peça atualizada com sucesso!")
      console.log("✅ Peça atualizada:", part)
      return part
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update part"
      console.error("❌ Erro ao atualizar peça:", errorMessage)
      showError("Erro", errorMessage)
      return null
    }
  }

  const deletePart = async (id: string): Promise<boolean> => {
    try {
      console.log("🔄 Excluindo peça:", id)
      await partUseCases.deletePart(id)
      setParts((prev) => prev.filter((p) => p.id !== id))
      success("Sucesso", "Peça excluída com sucesso!")
      console.log("✅ Peça excluída:", id)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete part"
      console.error("❌ Erro ao excluir peça:", errorMessage)
      showError("Erro", errorMessage)
      return false
    }
  }

  const updatePartStock = async (id: string, newQuantity: number): Promise<boolean> => {
    try {
      console.log("🔄 Atualizando estoque:", id, newQuantity)
      const part = parts.find((p) => p.id === id)
      if (!part) {
        throw new Error("Peça não encontrada")
      }

      const updatedPart = await partUseCases.updatePart({
        id,
        stockQuantity: newQuantity,
      })

      setParts((prev) => prev.map((p) => (p.id === updatedPart.id ? updatedPart : p)))
      console.log("✅ Estoque atualizado:", updatedPart)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update stock"
      console.error("❌ Erro ao atualizar estoque:", errorMessage)
      showError("Erro", errorMessage)
      return false
    }
  }

  const adjustStock = async (partId: string, quantity: number, reason: string): Promise<boolean> => {
    try {
      console.log("🔄 Ajustando estoque:", partId, quantity, reason)
      await partUseCases.adjustStock(partId, quantity, reason)
      // Refresh parts to get updated stock
      await fetchParts()
      success("Sucesso", "Estoque ajustado com sucesso!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to adjust stock"
      console.error("❌ Erro ao ajustar estoque:", errorMessage)
      showError("Erro", errorMessage)
      return false
    }
  }

  const createCategory = async (name: string, description?: string): Promise<PartCategory | null> => {
    try {
      console.log("🔄 Criando categoria:", name)
      const category = await partUseCases.createCategory(name, description)
      setCategories((prev) => [...prev, category])
      success("Sucesso", "Categoria criada com sucesso!")
      console.log("✅ Categoria criada:", category)
      return category
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create category"
      console.error("❌ Erro ao criar categoria:", errorMessage)
      showError("Erro", errorMessage)
      return null
    }
  }

  const getLowStockParts = async (): Promise<Part[]> => {
    try {
      return await partUseCases.getLowStockParts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get low stock parts"
      console.error("❌ Erro ao buscar peças com baixo estoque:", errorMessage)
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
    updatePartStock,
    adjustStock,
    createCategory,
    getLowStockParts,
    refetch: fetchParts,
  }
}
