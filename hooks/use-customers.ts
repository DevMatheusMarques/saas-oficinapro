"use client"

import { useState, useEffect } from "react"
import type { Customer, CreateCustomerData, UpdateCustomerData } from "@/domain/entities/customer"
import { CustomerUseCases } from "@/domain/use-cases/customer-use-cases"
import { SupabaseCustomerRepository } from "@/infrastructure/repositories/supabase-customer-repository"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/contexts/toast-context"

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  // Initialize Supabase client and use cases
  const initializeServices = () => {
    try {
      const supabase = createClient()
      const customerRepository = new SupabaseCustomerRepository(supabase)
      const customerUseCases = new CustomerUseCases(customerRepository)
      return { customerUseCases }
    } catch (err) {
      console.error("Erro ao inicializar serviços:", err)
      throw err
    }
  }

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const { customerUseCases } = initializeServices()
      const data = await customerUseCases.getAllCustomers()
      setCustomers(data)
      console.log("✅ Clientes carregados:", data.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customers"
      console.error("❌ Erro ao buscar clientes:", errorMessage)
      setError(errorMessage)
      showError("Erro", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (data: CreateCustomerData): Promise<Customer | null> => {
    try {
      console.log("🔄 Criando cliente:", data)
      const { customerUseCases } = initializeServices()
      const customer = await customerUseCases.createCustomer(data)
      setCustomers((prev) => [customer, ...prev])
      success("Sucesso", "Cliente criado com sucesso!")
      console.log("✅ Cliente criado:", customer)
      return customer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create customer"
      console.error("❌ Erro ao criar cliente:", errorMessage)
      showError("Erro", errorMessage)
      return null
    }
  }

  const updateCustomer = async (data: UpdateCustomerData): Promise<Customer | null> => {
    try {
      console.log("🔄 Atualizando cliente:", data)
      const { customerUseCases } = initializeServices()
      const customer = await customerUseCases.updateCustomer(data)
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)))
      success("Sucesso", "Cliente atualizado com sucesso!")
      console.log("✅ Cliente atualizado:", customer)
      return customer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update customer"
      console.error("❌ Erro ao atualizar cliente:", errorMessage)
      showError("Erro", errorMessage)
      return null
    }
  }

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      console.log("🔄 Excluindo cliente:", id)
      const { customerUseCases } = initializeServices()
      await customerUseCases.deleteCustomer(id)
      setCustomers((prev) => prev.filter((c) => c.id !== id))
      success("Sucesso", "Cliente excluído com sucesso!")
      console.log("✅ Cliente excluído:", id)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete customer"
      console.error("❌ Erro ao excluir cliente:", errorMessage)
      showError("Erro", errorMessage)
      return false
    }
  }

  const searchCustomers = async (name: string): Promise<Customer[]> => {
    try {
      console.log("🔍 Buscando clientes:", name)
      const { customerUseCases } = initializeServices()
      const results = await customerUseCases.searchCustomersByName(name)
      console.log("✅ Busca concluída:", results.length, "resultados")
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search customers"
      console.error("❌ Erro na busca:", errorMessage)
      showError("Erro", errorMessage)
      return []
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    refetch: fetchCustomers,
  }
}
