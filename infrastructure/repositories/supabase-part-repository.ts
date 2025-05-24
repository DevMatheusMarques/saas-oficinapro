import type { SupabaseClient } from "@supabase/supabase-js"
import type { Part, PartCategory, CreatePartData, UpdatePartData, StockMovement } from "../../domain/entities/part"
import type { PartRepository } from "../../domain/repositories/part-repository"

export class SupabasePartRepository implements PartRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Part[]> {
    const { data, error } = await this.supabase.from("parts").select("*").order("name")

    if (error) {
      throw new Error(`Failed to fetch parts: ${error.message}`)
    }

    return data.map(this.mapPartToEntity)
  }

  async findById(id: string): Promise<Part | null> {
    const { data, error } = await this.supabase.from("parts").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw new Error(`Failed to fetch part: ${error.message}`)
    }

    return this.mapPartToEntity(data)
  }

  async findByCategory(categoryId: string): Promise<Part[]> {
    const { data, error } = await this.supabase.from("parts").select("*").eq("category_id", categoryId).order("name")

    if (error) {
      throw new Error(`Failed to fetch parts by category: ${error.message}`)
    }

    return data.map(this.mapPartToEntity)
  }

  async findLowStock(): Promise<Part[]> {
    const { data, error } = await this.supabase
      .from("parts")
      .select("*")
      .filter("stock_quantity", "lte", "min_stock_level")
      .order("name")

    if (error) {
      throw new Error(`Failed to fetch low stock parts: ${error.message}`)
    }

    return data.map(this.mapPartToEntity)
  }

  async create(data: CreatePartData): Promise<Part> {
    const { data: result, error } = await this.supabase
      .from("parts")
      .insert({
        category_id: data.categoryId,
        name: data.name,
        description: data.description,
        part_number: data.partNumber,
        brand: data.brand,
        cost_price: data.costPrice,
        sale_price: data.salePrice,
        stock_quantity: data.stockQuantity,
        min_stock_level: data.minStockLevel,
        location: data.location,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create part: ${error.message}`)
    }

    return this.mapPartToEntity(result)
  }

  async update(data: UpdatePartData): Promise<Part> {
    const updateData: any = {}

    if (data.categoryId !== undefined) updateData.category_id = data.categoryId
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.partNumber !== undefined) updateData.part_number = data.partNumber
    if (data.brand !== undefined) updateData.brand = data.brand
    if (data.costPrice !== undefined) updateData.cost_price = data.costPrice
    if (data.salePrice !== undefined) updateData.sale_price = data.salePrice
    if (data.stockQuantity !== undefined) updateData.stock_quantity = data.stockQuantity
    if (data.minStockLevel !== undefined) updateData.min_stock_level = data.minStockLevel
    if (data.location !== undefined) updateData.location = data.location

    updateData.updated_at = new Date().toISOString()

    const { data: result, error } = await this.supabase
      .from("parts")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update part: ${error.message}`)
    }

    return this.mapPartToEntity(result)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("parts").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete part: ${error.message}`)
    }
  }

  async findAllCategories(): Promise<PartCategory[]> {
    const { data, error } = await this.supabase.from("part_categories").select("*").order("name")

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return data.map(this.mapCategoryToEntity)
  }

  async createCategory(name: string, description?: string): Promise<PartCategory> {
    const { data, error } = await this.supabase
      .from("part_categories")
      .insert({
        name,
        description,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`)
    }

    return this.mapCategoryToEntity(data)
  }

  async addStockMovement(movement: Omit<StockMovement, "id" | "createdAt">): Promise<StockMovement> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from("stock_movements")
      .insert({
        part_id: movement.partId,
        movement_type: movement.movementType,
        quantity: movement.quantity,
        unit_cost: movement.unitCost,
        total_cost: movement.totalCost,
        reason: movement.reason,
        reference_id: movement.referenceId,
        reference_type: movement.referenceType,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add stock movement: ${error.message}`)
    }

    return this.mapStockMovementToEntity(data)
  }

  async getStockMovements(partId: string): Promise<StockMovement[]> {
    const { data, error } = await this.supabase
      .from("stock_movements")
      .select("*")
      .eq("part_id", partId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch stock movements: ${error.message}`)
    }

    return data.map(this.mapStockMovementToEntity)
  }

  private mapPartToEntity(data: any): Part {
    return {
      id: data.id,
      categoryId: data.category_id,
      name: data.name,
      description: data.description,
      partNumber: data.part_number,
      brand: data.brand,
      costPrice: Number.parseFloat(data.cost_price) || 0,
      salePrice: Number.parseFloat(data.sale_price) || 0,
      stockQuantity: data.stock_quantity || 0,
      minStockLevel: data.min_stock_level || 0,
      location: data.location,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private mapCategoryToEntity(data: any): PartCategory {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: new Date(data.created_at),
    }
  }

  private mapStockMovementToEntity(data: any): StockMovement {
    return {
      id: data.id,
      partId: data.part_id,
      movementType: data.movement_type,
      quantity: data.quantity,
      unitCost: data.unit_cost ? Number.parseFloat(data.unit_cost) : undefined,
      totalCost: data.total_cost ? Number.parseFloat(data.total_cost) : undefined,
      reason: data.reason,
      referenceId: data.reference_id,
      referenceType: data.reference_type,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
    }
  }
}
