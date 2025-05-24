import type { SupabaseClient } from "@supabase/supabase-js"
import type { Budget, BudgetLaborItem, BudgetPartItem, CreateBudgetData } from "../../domain/entities/budget"
import type { BudgetRepository } from "../../domain/repositories/budget-repository"

export class SupabaseBudgetRepository implements BudgetRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Budget[]> {
    const { data, error } = await this.supabase
      .from("budgets")
      .select(`
        *,
        customers(name),
        motorcycles(brand, model, year)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch budgets: ${error.message}`)
    }

    return data.map(this.mapBudgetToEntity)
  }

  async findById(id: string): Promise<Budget | null> {
    const { data, error } = await this.supabase
      .from("budgets")
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
      throw new Error(`Failed to fetch budget: ${error.message}`)
    }

    return this.mapBudgetToEntity(data)
  }

  async findByCustomerId(customerId: string): Promise<Budget[]> {
    const { data, error } = await this.supabase
      .from("budgets")
      .select(`
        *,
        customers(name),
        motorcycles(brand, model, year)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch budgets by customer: ${error.message}`)
    }

    return data.map(this.mapBudgetToEntity)
  }

  async findByStatus(status: Budget["status"]): Promise<Budget[]> {
    const { data, error } = await this.supabase
      .from("budgets")
      .select(`
        *,
        customers(name),
        motorcycles(brand, model, year)
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch budgets by status: ${error.message}`)
    }

    return data.map(this.mapBudgetToEntity)
  }

  async create(data: CreateBudgetData): Promise<Budget> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    // Generate budget number
    const budgetNumber = await this.generateBudgetNumber()

    // Calculate totals
    const laborTotal = data.laborItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const partsTotal = data.partItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const totalAmount = laborTotal + partsTotal

    const { data: budget, error } = await this.supabase
      .from("budgets")
      .insert({
        customer_id: data.customerId,
        motorcycle_id: data.motorcycleId,
        budget_number: budgetNumber,
        description: data.description,
        labor_total: laborTotal,
        parts_total: partsTotal,
        total_amount: totalAmount,
        valid_until: data.validUntil?.toISOString().split("T")[0],
        notes: data.notes,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create budget: ${error.message}`)
    }

    // Insert labor items
    if (data.laborItems.length > 0) {
      const { error: laborError } = await this.supabase.from("budget_labor_items").insert(
        data.laborItems.map((item) => ({
          budget_id: budget.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        })),
      )

      if (laborError) {
        throw new Error(`Failed to create labor items: ${laborError.message}`)
      }
    }

    // Insert part items
    if (data.partItems.length > 0) {
      const { error: partError } = await this.supabase.from("budget_part_items").insert(
        data.partItems.map((item) => ({
          budget_id: budget.id,
          part_id: item.partId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        })),
      )

      if (partError) {
        throw new Error(`Failed to create part items: ${partError.message}`)
      }
    }

    return this.findById(budget.id) as Promise<Budget>
  }

  async update(id: string, data: Partial<Budget>): Promise<Budget> {
    const updateData: any = {}

    if (data.status !== undefined) updateData.status = data.status
    if (data.description !== undefined) updateData.description = data.description
    if (data.discount !== undefined) updateData.discount = data.discount
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.validUntil !== undefined) updateData.valid_until = data.validUntil?.toISOString().split("T")[0]

    updateData.updated_at = new Date().toISOString()

    const { error } = await this.supabase.from("budgets").update(updateData).eq("id", id)

    if (error) {
      throw new Error(`Failed to update budget: ${error.message}`)
    }

    return this.findById(id) as Promise<Budget>
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("budgets").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete budget: ${error.message}`)
    }
  }

  async getLaborItems(budgetId: string): Promise<BudgetLaborItem[]> {
    const { data, error } = await this.supabase
      .from("budget_labor_items")
      .select("*")
      .eq("budget_id", budgetId)
      .order("created_at")

    if (error) {
      throw new Error(`Failed to fetch labor items: ${error.message}`)
    }

    return data.map(this.mapLaborItemToEntity)
  }

  async getPartItems(budgetId: string): Promise<BudgetPartItem[]> {
    const { data, error } = await this.supabase
      .from("budget_part_items")
      .select(`
        *,
        parts(name)
      `)
      .eq("budget_id", budgetId)
      .order("created_at")

    if (error) {
      throw new Error(`Failed to fetch part items: ${error.message}`)
    }

    return data.map(this.mapPartItemToEntity)
  }

  async addLaborItem(item: Omit<BudgetLaborItem, "id" | "createdAt">): Promise<BudgetLaborItem> {
    const { data, error } = await this.supabase
      .from("budget_labor_items")
      .insert({
        budget_id: item.budgetId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add labor item: ${error.message}`)
    }

    return this.mapLaborItemToEntity(data)
  }

  async addPartItem(item: Omit<BudgetPartItem, "id" | "createdAt">): Promise<BudgetPartItem> {
    const { data, error } = await this.supabase
      .from("budget_part_items")
      .insert({
        budget_id: item.budgetId,
        part_id: item.partId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add part item: ${error.message}`)
    }

    return this.mapPartItemToEntity(data)
  }

  async updateLaborItem(id: string, data: Partial<BudgetLaborItem>): Promise<BudgetLaborItem> {
    const updateData: any = {}
    if (data.description !== undefined) updateData.description = data.description
    if (data.quantity !== undefined) updateData.quantity = data.quantity
    if (data.unitPrice !== undefined) updateData.unit_price = data.unitPrice
    if (data.totalPrice !== undefined) updateData.total_price = data.totalPrice

    const { data: result, error } = await this.supabase
      .from("budget_labor_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update labor item: ${error.message}`)
    }

    return this.mapLaborItemToEntity(result)
  }

  async updatePartItem(id: string, data: Partial<BudgetPartItem>): Promise<BudgetPartItem> {
    const updateData: any = {}
    if (data.partId !== undefined) updateData.part_id = data.partId
    if (data.description !== undefined) updateData.description = data.description
    if (data.quantity !== undefined) updateData.quantity = data.quantity
    if (data.unitPrice !== undefined) updateData.unit_price = data.unitPrice
    if (data.totalPrice !== undefined) updateData.total_price = data.totalPrice

    const { data: result, error } = await this.supabase
      .from("budget_part_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update part item: ${error.message}`)
    }

    return this.mapPartItemToEntity(result)
  }

  async deleteLaborItem(id: string): Promise<void> {
    const { error } = await this.supabase.from("budget_labor_items").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete labor item: ${error.message}`)
    }
  }

  async deletePartItem(id: string): Promise<void> {
    const { error } = await this.supabase.from("budget_part_items").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete part item: ${error.message}`)
    }
  }

  private async generateBudgetNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const { count } = await this.supabase
      .from("budgets")
      .select("id", { count: "exact", head: true })
      .like("budget_number", `ORC-${year}-%`)

    const nextNumber = (count || 0) + 1
    return `ORC-${year}-${nextNumber.toString().padStart(3, "0")}`
  }

  private mapBudgetToEntity(data: any): Budget {
    return {
      id: data.id,
      customerId: data.customer_id,
      motorcycleId: data.motorcycle_id,
      budgetNumber: data.budget_number,
      status: data.status,
      description: data.description,
      laborTotal: Number.parseFloat(data.labor_total) || 0,
      partsTotal: Number.parseFloat(data.parts_total) || 0,
      discount: Number.parseFloat(data.discount) || 0,
      totalAmount: Number.parseFloat(data.total_amount) || 0,
      validUntil: data.valid_until ? new Date(data.valid_until) : undefined,
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private mapLaborItemToEntity(data: any): BudgetLaborItem {
    return {
      id: data.id,
      budgetId: data.budget_id,
      description: data.description,
      quantity: data.quantity,
      unitPrice: Number.parseFloat(data.unit_price) || 0,
      totalPrice: Number.parseFloat(data.total_price) || 0,
      createdAt: new Date(data.created_at),
    }
  }

  private mapPartItemToEntity(data: any): BudgetPartItem {
    return {
      id: data.id,
      budgetId: data.budget_id,
      partId: data.part_id,
      description: data.description,
      quantity: data.quantity,
      unitPrice: Number.parseFloat(data.unit_price) || 0,
      totalPrice: Number.parseFloat(data.total_price) || 0,
      createdAt: new Date(data.created_at),
    }
  }
}
