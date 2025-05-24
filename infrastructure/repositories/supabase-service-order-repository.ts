import type { SupabaseClient } from "@supabase/supabase-js"
import type { ServiceOrder, CreateServiceOrderData } from "../../domain/entities/service-order"
import type { ServiceOrderRepository } from "../../domain/repositories/service-order-repository"

export class SupabaseServiceOrderRepository implements ServiceOrderRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<ServiceOrder[]> {
    const { data, error } = await this.supabase
      .from("service_orders")
      .select(`
        *,
        customers(name),
        motorcycles(brand, model, year)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch service orders: ${error.message}`)
    }

    return data.map(this.mapToEntity)
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    const { data, error } = await this.supabase
      .from("service_orders")
      .select(`
        *,
        customers(name),
        motorcycles(brand, model, year)
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw new Error(`Failed to fetch service order: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findByCustomerId(customerId: string): Promise<ServiceOrder[]> {
    const { data, error } = await this.supabase
      .from("service_orders")
      .select(`
        *,
        customers(name),
        motorcycles(brand, model, year)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch service orders by customer: ${error.message}`)
    }

    return data.map(this.mapToEntity)
  }

  async findByStatus(status: ServiceOrder["status"]): Promise<ServiceOrder[]> {
    const { data, error } = await this.supabase
      .from("service_orders")
      .select(`
        *,
        customers(name),
        motorcycles(brand, model, year)
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch service orders by status: ${error.message}`)
    }

    return data.map(this.mapToEntity)
  }

  async create(data: CreateServiceOrderData): Promise<ServiceOrder> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    // Generate order number
    const orderNumber = await this.generateOrderNumber()

    const { data: serviceOrder, error } = await this.supabase
      .from("service_orders")
      .insert({
        budget_id: data.budgetId,
        customer_id: data.customerId,
        motorcycle_id: data.motorcycleId,
        order_number: orderNumber,
        description: data.description,
        start_date: data.startDate?.toISOString().split("T")[0],
        estimated_completion: data.estimatedCompletion?.toISOString().split("T")[0],
        mechanic_id: data.mechanicId,
        notes: data.notes,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create service order: ${error.message}`)
    }

    return this.findById(serviceOrder.id) as Promise<ServiceOrder>
  }

  async update(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const updateData: any = {}

    if (data.status !== undefined) updateData.status = data.status
    if (data.description !== undefined) updateData.description = data.description
    if (data.startDate !== undefined) updateData.start_date = data.startDate?.toISOString().split("T")[0]
    if (data.estimatedCompletion !== undefined)
      updateData.estimated_completion = data.estimatedCompletion?.toISOString().split("T")[0]
    if (data.completionDate !== undefined) updateData.completion_date = data.completionDate?.toISOString().split("T")[0]
    if (data.mechanicId !== undefined) updateData.mechanic_id = data.mechanicId
    if (data.totalAmount !== undefined) updateData.total_amount = data.totalAmount
    if (data.notes !== undefined) updateData.notes = data.notes

    updateData.updated_at = new Date().toISOString()

    const { error } = await this.supabase.from("service_orders").update(updateData).eq("id", id)

    if (error) {
      throw new Error(`Failed to update service order: ${error.message}`)
    }

    return this.findById(id) as Promise<ServiceOrder>
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("service_orders").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete service order: ${error.message}`)
    }
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const { count } = await this.supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .like("order_number", `OS-${year}-%`)

    const nextNumber = (count || 0) + 1
    return `OS-${year}-${nextNumber.toString().padStart(3, "0")}`
  }

  private mapToEntity(data: any): ServiceOrder {
    return {
      id: data.id,
      budgetId: data.budget_id,
      customerId: data.customer_id,
      motorcycleId: data.motorcycle_id,
      orderNumber: data.order_number,
      status: data.status,
      description: data.description,
      startDate: data.start_date ? new Date(data.start_date) : undefined,
      estimatedCompletion: data.estimated_completion ? new Date(data.estimated_completion) : undefined,
      completionDate: data.completion_date ? new Date(data.completion_date) : undefined,
      mechanicId: data.mechanic_id,
      totalAmount: Number.parseFloat(data.total_amount) || 0,
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
