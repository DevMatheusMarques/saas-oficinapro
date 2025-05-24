import type { Motorcycle, CreateMotorcycleData, UpdateMotorcycleData } from "../entities/motorcycle"

export interface MotorcycleRepository {
  findAll(): Promise<Motorcycle[]>
  findById(id: string): Promise<Motorcycle | null>
  findByCustomerId(customerId: string): Promise<Motorcycle[]>
  create(data: CreateMotorcycleData): Promise<Motorcycle>
  update(data: UpdateMotorcycleData): Promise<Motorcycle>
  delete(id: string): Promise<void>
}
