import type { SupabaseClient } from "@supabase/supabase-js"
import type { Motorcycle, CreateMotorcycleData, UpdateMotorcycleData } from "../../domain/entities/motorcycle"
import type { MotorcycleRepository } from "../../domain/repositories/motorcycle-repository"

export class SupabaseMotorcycleRepository implements MotorcycleRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Motorcycle[]> {
    const { data, error } = await this.supabase
      .from("motorcycles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch motorcycles: ${error.message}`)
    }

    return data.map(this.mapToEntity)
  }

  async findById(id: string): Promise<Motorcycle | null> {
    const { data, error } = await this.supabase.from("motorcycles").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw new Error(`Failed to fetch motorcycle: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findByCustomerId(customerId: string): Promise<Motorcycle[]> {
    const { data, error } = await this.supabase
      .from("motorcycles")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch motorcycles: ${error.message}`)
    }

    return data.map(this.mapToEntity)
  }

  async create(data: CreateMotorcycleData): Promise<Motorcycle> {
    const { data: result, error } = await this.supabase
      .from("motorcycles")
      .insert({
        customer_id: data.customerId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        license_plate: data.licensePlate,
        chassis_number: data.chassisNumber,
        engine_number: data.engineNumber,
        mileage: data.mileage || 0,
        notes: data.notes,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create motorcycle: ${error.message}`)
    }

    return this.mapToEntity(result)
  }

  async update(data: UpdateMotorcycleData): Promise<Motorcycle> {
    const updateData: any = {}

    if (data.customerId !== undefined) updateData.customer_id = data.customerId
    if (data.brand !== undefined) updateData.brand = data.brand
    if (data.model !== undefined) updateData.model = data.model
    if (data.year !== undefined) updateData.year = data.year
    if (data.color !== undefined) updateData.color = data.color
    if (data.licensePlate !== undefined) updateData.license_plate = data.licensePlate
    if (data.chassisNumber !== undefined) updateData.chassis_number = data.chassisNumber
    if (data.engineNumber !== undefined) updateData.engine_number = data.engineNumber
    if (data.mileage !== undefined) updateData.mileage = data.mileage
    if (data.notes !== undefined) updateData.notes = data.notes

    updateData.updated_at = new Date().toISOString()

    const { data: result, error } = await this.supabase
      .from("motorcycles")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update motorcycle: ${error.message}`)
    }

    return this.mapToEntity(result)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("motorcycles").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete motorcycle: ${error.message}`)
    }
  }

  private mapToEntity(data: any): Motorcycle {
    return {
      id: data.id,
      customerId: data.customer_id,
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color,
      licensePlate: data.license_plate,
      chassisNumber: data.chassis_number,
      engineNumber: data.engine_number,
      mileage: data.mileage,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
