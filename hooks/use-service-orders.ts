"use client"

import { useState, useEffect } from "react"
import type { ServiceOrder, CreateServiceOrderData } from "@/domain/entities/service-order"
import { ServiceOrderUseCases } from "@/domain/use-cases/service-order-use-cases"
import { SupabaseServiceOrderRepository } from "@/infrastructure/repositories/supabase-service-order-repository"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/contexts/toast-context"

export function useServiceOrders() {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const supabase = createClient()
  const serviceOrderRepository = new SupabaseServiceOrderRepository(supabase)
  const serviceOrderUseCases = new ServiceOrderUseCases(serviceOrderRepository)

  const fetchServiceOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await serviceOrderUseCases.getAllServiceOrders()
      setServiceOrders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch service orders"
      setError(errorMessage)
      console.error("Error fetching service orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const createServiceOrder = async (data: CreateServiceOrderData): Promise<ServiceOrder | null> => {
    try {
      const serviceOrder = await serviceOrderUseCases.createServiceOrder(data)
      setServiceOrders((prev) => [serviceOrder, ...prev])
      success("Sucesso", "Ordem de serviço criada com sucesso!")
      return serviceOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create service order"
      showError("Erro", errorMessage)
      console.error("Error creating service order:", err)
      return null
    }
  }

  const updateServiceOrder = async (id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder | null> => {
    try {
      const serviceOrder = await serviceOrderUseCases.updateServiceOrder(id, data)
      setServiceOrders((prev) => prev.map((so) => (so.id === serviceOrder.id ? serviceOrder : so)))
      success("Sucesso", "Ordem de serviço atualizada com sucesso!")
      return serviceOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update service order"
      showError("Erro", errorMessage)
      console.error("Error updating service order:", err)
      return null
    }
  }

  const deleteServiceOrder = async (id: string): Promise<boolean> => {
    try {
      await serviceOrderUseCases.deleteServiceOrder(id)
      setServiceOrders((prev) => prev.filter((so) => so.id !== id))
      success("Sucesso", "Ordem de serviço excluída com sucesso!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete service order"
      showError("Erro", errorMessage)
      console.error("Error deleting service order:", err)
      return false
    }
  }

  const startServiceOrder = async (id: string): Promise<boolean> => {
    try {
      await serviceOrderUseCases.startServiceOrder(id)
      await fetchServiceOrders()
      success("Sucesso", "Ordem de serviço iniciada!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start service order"
      showError("Erro", errorMessage)
      console.error("Error starting service order:", err)
      return false
    }
  }

  const completeServiceOrder = async (id: string): Promise<boolean> => {
    try {
      await serviceOrderUseCases.completeServiceOrder(id)
      await fetchServiceOrders()
      success("Sucesso", "Ordem de serviço concluída!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete service order"
      showError("Erro", errorMessage)
      console.error("Error completing service order:", err)
      return false
    }
  }

  const deliverServiceOrder = async (id: string): Promise<boolean> => {
    try {
      await serviceOrderUseCases.deliverServiceOrder(id)
      await fetchServiceOrders()
      success("Sucesso", "Ordem de serviço entregue!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to deliver service order"
      showError("Erro", errorMessage)
      console.error("Error delivering service order:", err)
      return false
    }
  }

  useEffect(() => {
    fetchServiceOrders()
  }, [])

  return {
    serviceOrders,
    loading,
    error,
    createServiceOrder,
    updateServiceOrder,
    deleteServiceOrder,
    startServiceOrder,
    completeServiceOrder,
    deliverServiceOrder,
    refetch: fetchServiceOrders,
  }
}
