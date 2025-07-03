"use client"

import { useState, useEffect } from "react"
import type { Part } from "@/domain/entities/part"
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

  const fetchParts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar peças
      const { data: partsData, error: partsError } = await supabase.from("parts").select("*").order("name")

      if (partsError) {
        throw new Error(`Failed to fetch parts: ${partsError.message}`)
      }

      // Mapear os dados corretamente
      const mappedParts: Part[] = (partsData || []).map((data: any) => ({
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
        category: data.category || "Sem categoria",
        supplier: data.supplier,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }))

      setParts(mappedParts)

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(mappedParts.map((part) => part.category).filter(Boolean))).map(
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

  const createPart = async (data: any): Promise<Part | null> => {
    try {
      const { data: result, error } = await supabase
        .from("parts")
        .insert({
          name: data.name,
          description: data.description,
          part_number: data.code,
          category: data.category,
          stock_quantity: data.quantity,
          min_stock_level: data.minimum_stock,
          unit: data.unit,
          cost_price: data.cost_price,
          sale_price: data.sale_price,
          supplier: data.supplier,
          location: data.location,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create part: ${error.message}`)
      }

      const newPart: Part = {
        id: result.id,
        name: result.name,
        description: result.description,
        code: result.part_number,
        partNumber: result.part_number,
        category: result.category,
        quantity: result.stock_quantity,
        stockQuantity: result.stock_quantity,
        minimum_stock: result.min_stock_level,
        minStockLevel: result.min_stock_level,
        unit: result.unit,
        cost_price: result.cost_price,
        costPrice: result.cost_price,
        sale_price: result.sale_price,
        salePrice: result.sale_price,
        supplier: result.supplier,
        location: result.location,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      }

      setParts((prev) => [newPart, ...prev])
      success("Sucesso", "Peça criada com sucesso!")
      return newPart
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create part"
      showError("Erro", errorMessage)
      console.error("Error creating part:", err)
      return null
    }
  }

  const updatePart = async (id: string, data: any): Promise<Part | null> => {
    try {
      const { data: result, error } = await supabase
        .from("parts")
        .update({
          name: data.name,
          description: data.description,
          part_number: data.code,
          category: data.category,
          stock_quantity: data.quantity,
          min_stock_level: data.minimum_stock,
          unit: data.unit,
          cost_price: data.cost_price,
          sale_price: data.sale_price,
          supplier: data.supplier,
          location: data.location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update part: ${error.message}`)
      }

      const updatedPart: Part = {
        id: result.id,
        name: result.name,
        description: result.description,
        code: result.part_number,
        partNumber: result.part_number,
        category: result.category,
        quantity: result.stock_quantity,
        stockQuantity: result.stock_quantity,
        minimum_stock: result.min_stock_level,
        minStockLevel: result.min_stock_level,
        unit: result.unit,
        cost_price: result.cost_price,
        costPrice: result.cost_price,
        sale_price: result.sale_price,
        salePrice: result.sale_price,
        supplier: result.supplier,
        location: result.location,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      }

      setParts((prev) => prev.map((p) => (p.id === updatedPart.id ? updatedPart : p)))
      success("Sucesso", "Peça atualizada com sucesso!")
      return updatedPart
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update part"
      showError("Erro", errorMessage)
      console.error("Error updating part:", err)
      return null
    }
  }

  const deletePart = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("parts").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete part: ${error.message}`)
      }

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
      const { error } = await supabase
        .from("parts")
        .update({
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        throw new Error(`Failed to update stock: ${error.message}`)
      }

      setParts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, quantity: newQuantity, stockQuantity: newQuantity } : p)),
      )
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
