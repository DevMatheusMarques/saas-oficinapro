import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  Payment,
  CreatePaymentData,
  AccountPayable,
  CreateAccountPayableData,
} from "../../domain/entities/payment"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"

export class SupabasePaymentRepository implements PaymentRepository {
  constructor(private supabase: SupabaseClient) {}

  // Payments
  async findAllPayments(): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from("payments")
      .select(`
        *,
        customers(name)
      `)
      .order("payment_date", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`)
    }

    return data.map(this.mapPaymentToEntity)
  }

  async findPaymentById(id: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from("payments")
      .select(`
        *,
        customers(name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw new Error(`Failed to fetch payment: ${error.message}`)
    }

    return this.mapPaymentToEntity(data)
  }

  async findPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from("payments")
      .select(`
        *,
        customers(name)
      `)
      .eq("customer_id", customerId)
      .order("payment_date", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch payments by customer: ${error.message}`)
    }

    return data.map(this.mapPaymentToEntity)
  }

  async createPayment(data: CreatePaymentData): Promise<Payment> {
    const { data: payment, error } = await this.supabase
      .from("payments")
      .insert({
        customer_id: data.customerId,
        service_order_id: data.serviceOrderId,
        budget_id: data.budgetId,
        amount: data.amount,
        payment_type: data.paymentType,
        payment_date: data.paymentDate.toISOString().split("T")[0],
        description: data.description,
        reference_number: data.referenceNumber,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`)
    }

    return this.findPaymentById(payment.id) as Promise<Payment>
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const updateData: any = {}

    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.paymentType !== undefined) updateData.payment_type = data.paymentType
    if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate.toISOString().split("T")[0]
    if (data.description !== undefined) updateData.description = data.description
    if (data.referenceNumber !== undefined) updateData.reference_number = data.referenceNumber

    const { error } = await this.supabase.from("payments").update(updateData).eq("id", id)

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`)
    }

    return this.findPaymentById(id) as Promise<Payment>
  }

  async deletePayment(id: string): Promise<void> {
    const { error } = await this.supabase.from("payments").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete payment: ${error.message}`)
    }
  }

  // Accounts Payable
  async findAllAccountsPayable(): Promise<AccountPayable[]> {
    const { data, error } = await this.supabase
      .from("accounts_payable")
      .select("*")
      .order("due_date", { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch accounts payable: ${error.message}`)
    }

    return data.map(this.mapAccountPayableToEntity)
  }

  async findAccountPayableById(id: string): Promise<AccountPayable | null> {
    const { data, error } = await this.supabase.from("accounts_payable").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw new Error(`Failed to fetch account payable: ${error.message}`)
    }

    return this.mapAccountPayableToEntity(data)
  }

  async findAccountsPayableByStatus(status: AccountPayable["status"]): Promise<AccountPayable[]> {
    const { data, error } = await this.supabase
      .from("accounts_payable")
      .select("*")
      .eq("status", status)
      .order("due_date", { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch accounts payable by status: ${error.message}`)
    }

    return data.map(this.mapAccountPayableToEntity)
  }

  async createAccountPayable(data: CreateAccountPayableData): Promise<AccountPayable> {
    const { data: accountPayable, error } = await this.supabase
      .from("accounts_payable")
      .insert({
        supplier_name: data.supplierName,
        description: data.description,
        amount: data.amount,
        due_date: data.dueDate.toISOString().split("T")[0],
        reference_number: data.referenceNumber,
        notes: data.notes,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create account payable: ${error.message}`)
    }

    return this.mapAccountPayableToEntity(accountPayable)
  }

  async updateAccountPayable(id: string, data: Partial<AccountPayable>): Promise<AccountPayable> {
    const updateData: any = {}

    if (data.supplierName !== undefined) updateData.supplier_name = data.supplierName
    if (data.description !== undefined) updateData.description = data.description
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate.toISOString().split("T")[0]
    if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate?.toISOString().split("T")[0]
    if (data.status !== undefined) updateData.status = data.status
    if (data.referenceNumber !== undefined) updateData.reference_number = data.referenceNumber
    if (data.notes !== undefined) updateData.notes = data.notes

    updateData.updated_at = new Date().toISOString()

    const { error } = await this.supabase.from("accounts_payable").update(updateData).eq("id", id)

    if (error) {
      throw new Error(`Failed to update account payable: ${error.message}`)
    }

    return this.findAccountPayableById(id) as Promise<AccountPayable>
  }

  async deleteAccountPayable(id: string): Promise<void> {
    const { error } = await this.supabase.from("accounts_payable").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete account payable: ${error.message}`)
    }
  }

  private mapPaymentToEntity(data: any): Payment {
    return {
      id: data.id,
      customerId: data.customer_id,
      serviceOrderId: data.service_order_id,
      budgetId: data.budget_id,
      amount: Number.parseFloat(data.amount) || 0,
      paymentType: data.payment_type,
      paymentDate: new Date(data.payment_date),
      description: data.description,
      referenceNumber: data.reference_number,
      createdAt: new Date(data.created_at),
    }
  }

  private mapAccountPayableToEntity(data: any): AccountPayable {
    return {
      id: data.id,
      supplierName: data.supplier_name,
      description: data.description,
      amount: Number.parseFloat(data.amount) || 0,
      dueDate: new Date(data.due_date),
      paymentDate: data.payment_date ? new Date(data.payment_date) : undefined,
      status: data.status,
      referenceNumber: data.reference_number,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
