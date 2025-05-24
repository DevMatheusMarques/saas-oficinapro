import type { Part, PartCategory, CreatePartData, UpdatePartData, StockMovement } from "../entities/part"

export interface PartRepository {
  findAll(): Promise<Part[]>
  findById(id: string): Promise<Part | null>
  findByCategory(categoryId: string): Promise<Part[]>
  findLowStock(): Promise<Part[]>
  create(data: CreatePartData): Promise<Part>
  update(data: UpdatePartData): Promise<Part>
  delete(id: string): Promise<void>

  // Categories
  findAllCategories(): Promise<PartCategory[]>
  createCategory(name: string, description?: string): Promise<PartCategory>

  // Stock movements
  addStockMovement(movement: Omit<StockMovement, "id" | "createdAt">): Promise<StockMovement>
  getStockMovements(partId: string): Promise<StockMovement[]>
}
