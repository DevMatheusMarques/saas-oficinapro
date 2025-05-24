import type { SupabaseClient } from "@supabase/supabase-js"
import type { Customer, CreateCustomerData, UpdateCustomerData } from "../../domain/entities/customer"
import type { CustomerRepository } from "../../domain/repositories/customer-repository"

export class SupabaseCustomerRepository implements CustomerRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Customer[]> {
    const { data, error } = await this.supabase.from("customers").select("*").order("name")

    if (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`)
    }

    return data.map(this.mapToEntity)
  }

  async findById(id: string): Promise<Customer | null> {
    const { data, error } = await this.supabase.from("customers").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw new Error(`Failed to fetch customer: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findByName(name: string): Promise<Customer[]> {
    const { data, error } = await this.supabase.from("customers").select("*").ilike("name", `%${name}%`).order("name")

    if (error) {
      throw new Error(`Failed to search customers: ${error.message}`)
    }

    return data.map(this.mapToEntity)
  }

  async create(data: CreateCustomerData): Promise<Customer> {
    const { data: result, error } = await this.supabase
      .from("customers")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf_cnpj: data.cpfCnpj,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        notes: data.notes,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create customer: ${error.message}`)
    }

    return this.mapToEntity(result)
  }

  async update(data: UpdateCustomerData): Promise<Customer> {
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.cpfCnpj !== undefined) updateData.cpf_cnpj = data.cpfCnpj
    if (data.address !== undefined) updateData.address = data.address
    if (data.city !== undefined) updateData.city = data.city
    if (data.state !== undefined) updateData.state = data.state
    if (data.zipCode !== undefined) updateData.zip_code = data.zipCode
    if (data.notes !== undefined) updateData.notes = data.notes

    updateData.updated_at = new Date().toISOString()

    const { data: result, error } = await this.supabase
      .from("customers")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update customer: ${error.message}`)
    }

    return this.mapToEntity(result)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("customers").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete customer: ${error.message}`)
    }
  }

  private mapToEntity(data: any): Customer {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpfCnpj: data.cpf_cnpj,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
