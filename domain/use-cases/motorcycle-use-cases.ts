import type { Motorcycle, CreateMotorcycleData, UpdateMotorcycleData } from "../entities/motorcycle"
import type { MotorcycleRepository } from "../repositories/motorcycle-repository"

export class MotorcycleUseCases {
  constructor(private motorcycleRepository: MotorcycleRepository) {}

  async getAllMotorcycles(): Promise<Motorcycle[]> {
    return this.motorcycleRepository.findAll()
  }

  async getMotorcycleById(id: string): Promise<Motorcycle | null> {
    if (!id) {
      throw new Error("Motorcycle ID is required")
    }
    return this.motorcycleRepository.findById(id)
  }

  async getMotorcyclesByCustomerId(customerId: string): Promise<Motorcycle[]> {
    if (!customerId) {
      throw new Error("Customer ID is required")
    }
    return this.motorcycleRepository.findByCustomerId(customerId)
  }

  async createMotorcycle(data: CreateMotorcycleData): Promise<Motorcycle> {
    if (!data.customerId) {
      throw new Error("Customer ID is required")
    }

    if (!data.brand.trim()) {
      throw new Error("Brand is required")
    }

    if (!data.model.trim()) {
      throw new Error("Model is required")
    }

    if (data.year && (data.year < 1900 || data.year > new Date().getFullYear() + 1)) {
      throw new Error("Invalid year")
    }

    if (data.mileage && data.mileage < 0) {
      throw new Error("Mileage cannot be negative")
    }

    return this.motorcycleRepository.create(data)
  }

  async updateMotorcycle(data: UpdateMotorcycleData): Promise<Motorcycle> {
    if (!data.id) {
      throw new Error("Motorcycle ID is required")
    }

    if (data.brand && !data.brand.trim()) {
      throw new Error("Brand cannot be empty")
    }

    if (data.model && !data.model.trim()) {
      throw new Error("Model cannot be empty")
    }

    if (data.year && (data.year < 1900 || data.year > new Date().getFullYear() + 1)) {
      throw new Error("Invalid year")
    }

    if (data.mileage && data.mileage < 0) {
      throw new Error("Mileage cannot be negative")
    }

    return this.motorcycleRepository.update(data)
  }

  async deleteMotorcycle(id: string): Promise<void> {
    if (!id) {
      throw new Error("Motorcycle ID is required")
    }

    const motorcycle = await this.motorcycleRepository.findById(id)
    if (!motorcycle) {
      throw new Error("Motorcycle not found")
    }

    return this.motorcycleRepository.delete(id)
  }
}
