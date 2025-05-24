"use client"

import { useState, useEffect } from "react"
import type { Motorcycle, CreateMotorcycleData, UpdateMotorcycleData } from "@/domain/entities/motorcycle"
import { MotorcycleUseCases } from "@/domain/use-cases/motorcycle-use-cases"
import { SupabaseMotorcycleRepository } from "@/infrastructure/repositories/supabase-motorcycle-repository"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/contexts/toast-context"

export function useMotorcycles(customerId?: string) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const supabase = createClient()
  const motorcycleRepository = new SupabaseMotorcycleRepository(supabase)
  const motorcycleUseCases = new MotorcycleUseCases(motorcycleRepository)

  const fetchMotorcycles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = customerId
        ? await motorcycleUseCases.getMotorcyclesByCustomerId(customerId)
        : await motorcycleUseCases.getAllMotorcycles()
      setMotorcycles(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch motorcycles"
      setError(errorMessage)
      showError("Erro", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createMotorcycle = async (data: CreateMotorcycleData): Promise<Motorcycle | null> => {
    try {
      const motorcycle = await motorcycleUseCases.createMotorcycle(data)
      setMotorcycles((prev) => [motorcycle, ...prev])
      success("Sucesso", "Moto criada com sucesso!")
      return motorcycle
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create motorcycle"
      showError("Erro", errorMessage)
      return null
    }
  }

  const updateMotorcycle = async (data: UpdateMotorcycleData): Promise<Motorcycle | null> => {
    try {
      const motorcycle = await motorcycleUseCases.updateMotorcycle(data)
      setMotorcycles((prev) => prev.map((m) => (m.id === motorcycle.id ? motorcycle : m)))
      success("Sucesso", "Moto atualizada com sucesso!")
      return motorcycle
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update motorcycle"
      showError("Erro", errorMessage)
      return null
    }
  }

  const deleteMotorcycle = async (id: string): Promise<boolean> => {
    try {
      await motorcycleUseCases.deleteMotorcycle(id)
      setMotorcycles((prev) => prev.filter((m) => m.id !== id))
      success("Sucesso", "Moto excluída com sucesso!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete motorcycle"
      showError("Erro", errorMessage)
      return false
    }
  }

  useEffect(() => {
    fetchMotorcycles()
  }, [customerId])

  return {
    motorcycles,
    loading,
    error,
    createMotorcycle,
    updateMotorcycle,
    deleteMotorcycle,
    refetch: fetchMotorcycles,
  }
}
