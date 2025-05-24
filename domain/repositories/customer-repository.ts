import type { Customer, CreateCustomerData, UpdateCustomerData } from "../entities/customer"

export interface CustomerRepository {
  findAll(): Promise<Customer[]>
  findById(id: string): Promise<Customer | null>
  findByName(name: string): Promise<Customer[]>
  create(data: CreateCustomerData): Promise<Customer>
  update(data: UpdateCustomerData): Promise<Customer>
  delete(id: string): Promise<void>
}
