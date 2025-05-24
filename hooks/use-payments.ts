"use client"

import { useState, useEffect } from "react"
import type { Payment, CreatePaymentData, AccountPayable, CreateAccountPayableData } from "@/domain/entities/payment"
import { PaymentUseCases } from "@/domain/use-cases/payment-use-cases"
import { SupabasePaymentRepository } from "@/infrastructure/repositories/supabase-payment-repository"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/contexts/toast-context"

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const supabase = createClient()
  const paymentRepository = new SupabasePaymentRepository(supabase)
  const paymentUseCases = new PaymentUseCases(paymentRepository)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [paymentsData, accountsPayableData] = await Promise.all([
        paymentUseCases.getAllPayments(),
        paymentUseCases.getAllAccountsPayable(),
      ])
      setPayments(paymentsData)
      setAccountsPayable(accountsPayableData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch financial data"
      setError(errorMessage)
      showError("Erro", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async (data: CreatePaymentData): Promise<Payment | null> => {
    try {
      const payment = await paymentUseCases.createPayment(data)
      setPayments((prev) => [payment, ...prev])
      success("Sucesso", "Pagamento registrado com sucesso!")
      return payment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create payment"
      showError("Erro", errorMessage)
      return null
    }
  }

  const updatePayment = async (id: string, data: Partial<Payment>): Promise<Payment | null> => {
    try {
      const payment = await paymentUseCases.updatePayment(id, data)
      setPayments((prev) => prev.map((p) => (p.id === payment.id ? payment : p)))
      success("Sucesso", "Pagamento atualizado com sucesso!")
      return payment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update payment"
      showError("Erro", errorMessage)
      return null
    }
  }

  const deletePayment = async (id: string): Promise<boolean> => {
    try {
      await paymentUseCases.deletePayment(id)
      setPayments((prev) => prev.filter((p) => p.id !== id))
      success("Sucesso", "Pagamento excluído com sucesso!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete payment"
      showError("Erro", errorMessage)
      return false
    }
  }

  const createAccountPayable = async (data: CreateAccountPayableData): Promise<AccountPayable | null> => {
    try {
      const accountPayable = await paymentUseCases.createAccountPayable(data)
      setAccountsPayable((prev) => [accountPayable, ...prev])
      success("Sucesso", "Conta a pagar criada com sucesso!")
      return accountPayable
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account payable"
      showError("Erro", errorMessage)
      return null
    }
  }

  const updateAccountPayable = async (id: string, data: Partial<AccountPayable>): Promise<AccountPayable | null> => {
    try {
      const accountPayable = await paymentUseCases.updateAccountPayable(id, data)
      setAccountsPayable((prev) => prev.map((ap) => (ap.id === accountPayable.id ? accountPayable : ap)))
      success("Sucesso", "Conta a pagar atualizada com sucesso!")
      return accountPayable
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update account payable"
      showError("Erro", errorMessage)
      return null
    }
  }

  const deleteAccountPayable = async (id: string): Promise<boolean> => {
    try {
      await paymentUseCases.deleteAccountPayable(id)
      setAccountsPayable((prev) => prev.filter((ap) => ap.id !== id))
      success("Sucesso", "Conta a pagar excluída com sucesso!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete account payable"
      showError("Erro", errorMessage)
      return false
    }
  }

  const payAccountPayable = async (id: string): Promise<boolean> => {
    try {
      await paymentUseCases.payAccountPayable(id, new Date())
      await fetchData()
      success("Sucesso", "Conta marcada como paga!")
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to pay account payable"
      showError("Erro", errorMessage)
      return false
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    payments,
    accountsPayable,
    loading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
    createAccountPayable,
    updateAccountPayable,
    deleteAccountPayable,
    payAccountPayable,
    refetch: fetchData,
  }
}
