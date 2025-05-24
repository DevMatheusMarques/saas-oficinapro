import type { Part, PartCategory, CreatePartData, UpdatePartData, StockMovement } from "../entities/part"
import type { PartRepository } from "../repositories/part-repository"

export class PartUseCases {
  constructor(private partRepository: PartRepository) {}

  async getAllParts(): Promise<Part[]> {
    return this.partRepository.findAll()
  }

  async getPartById(id: string): Promise<Part | null> {
    if (!id) {
      throw new Error("Part ID is required")
    }
    return this.partRepository.findById(id)
  }

  async getPartsByCategory(categoryId: string): Promise<Part[]> {
    if (!categoryId) {
      throw new Error("Category ID is required")
    }
    return this.partRepository.findByCategory(categoryId)
  }

  async getLowStockParts(): Promise<Part[]> {
    return this.partRepository.findLowStock()
  }

  async createPart(data: CreatePartData): Promise<Part> {
    if (!data.name.trim()) {
      throw new Error("Part name is required")
    }

    if (data.costPrice < 0 || data.salePrice < 0) {
      throw new Error("Prices cannot be negative")
    }

    if (data.stockQuantity < 0 || data.minStockLevel < 0) {
      throw new Error("Stock quantities cannot be negative")
    }

    return this.partRepository.create(data)
  }

  async updatePart(data: UpdatePartData): Promise<Part> {
    if (!data.id) {
      throw new Error("Part ID is required")
    }

    if (data.name && !data.name.trim()) {
      throw new Error("Part name cannot be empty")
    }

    if ((data.costPrice !== undefined && data.costPrice < 0) || (data.salePrice !== undefined && data.salePrice < 0)) {
      throw new Error("Prices cannot be negative")
    }

    return this.partRepository.update(data)
  }

  async deletePart(id: string): Promise<void> {
    if (!id) {
      throw new Error("Part ID is required")
    }

    const part = await this.partRepository.findById(id)
    if (!part) {
      throw new Error("Part not found")
    }

    return this.partRepository.delete(id)
  }

  async adjustStock(
    partId: string,
    quantity: number,
    reason: string,
    movementType: "in" | "out" | "adjustment" = "adjustment",
  ): Promise<void> {
    if (!partId) {
      throw new Error("Part ID is required")
    }

    if (quantity === 0) {
      throw new Error("Quantity cannot be zero")
    }

    const part = await this.partRepository.findById(partId)
    if (!part) {
      throw new Error("Part not found")
    }

    // Add stock movement
    await this.partRepository.addStockMovement({
      partId,
      movementType,
      quantity,
      reason,
      createdBy: undefined, // Will be set by the repository implementation
    })

    // Update part stock
    const newStock = part.stockQuantity + quantity
    if (newStock < 0) {
      throw new Error("Insufficient stock")
    }

    await this.partRepository.update({
      id: partId,
      stockQuantity: newStock,
    })
  }

  async getAllCategories(): Promise<PartCategory[]> {
    return this.partRepository.findAllCategories()
  }

  async createCategory(name: string, description?: string): Promise<PartCategory> {
    if (!name.trim()) {
      throw new Error("Category name is required")
    }
    return this.partRepository.createCategory(name, description)
  }

  async getStockMovements(partId: string): Promise<StockMovement[]> {
    if (!partId) {
      throw new Error("Part ID is required")
    }
    return this.partRepository.getStockMovements(partId)
  }
}
