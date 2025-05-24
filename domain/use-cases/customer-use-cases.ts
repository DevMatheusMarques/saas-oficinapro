import type { Customer, CreateCustomerData, UpdateCustomerData } from "../entities/customer"
import type { CustomerRepository } from "../repositories/customer-repository"

export class CustomerUseCases {
  constructor(private customerRepository: CustomerRepository) {}

  async getAllCustomers(): Promise<Customer[]> {
    return this.customerRepository.findAll()
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    if (!id) {
      throw new Error("Customer ID is required")
    }
    return this.customerRepository.findById(id)
  }

  async searchCustomersByName(name: string): Promise<Customer[]> {
    if (!name.trim()) {
      throw new Error("Search name cannot be empty")
    }
    return this.customerRepository.findByName(name)
  }

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    if (!data.name.trim()) {
      throw new Error("Customer name is required")
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Invalid email format")
    }

    return this.customerRepository.create(data)
  }

  async updateCustomer(data: UpdateCustomerData): Promise<Customer> {
    if (!data.id) {
      throw new Error("Customer ID is required")
    }

    if (data.name && !data.name.trim()) {
      throw new Error("Customer name cannot be empty")
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Invalid email format")
    }

    return this.customerRepository.update(data)
  }

  async deleteCustomer(id: string): Promise<void> {
    if (!id) {
      throw new Error("Customer ID is required")
    }

    const customer = await this.customerRepository.findById(id)
    if (!customer) {
      throw new Error("Customer not found")
    }

    return this.customerRepository.delete(id)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
