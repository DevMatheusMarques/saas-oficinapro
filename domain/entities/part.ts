export interface PartCategory {
  id: string
  name: string
  description?: string
  createdAt: Date
}

export interface Part {
  id: string
  categoryId?: string
  name: string
  description?: string
  partNumber?: string
  brand?: string
  costPrice: number
  salePrice: number
  stockQuantity: number
  minStockLevel: number
  location?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePartData {
  categoryId?: string
  name: string
  description?: string
  partNumber?: string
  brand?: string
  costPrice: number
  salePrice: number
  stockQuantity: number
  minStockLevel: number
  location?: string
}

export interface UpdatePartData extends Partial<CreatePartData> {
  id: string
}

export interface StockMovement {
  id: string
  partId: string
  movementType: "in" | "out" | "adjustment"
  quantity: number
  unitCost?: number
  totalCost?: number
  reason?: string
  referenceId?: string
  referenceType?: string
  createdBy?: string
  createdAt: Date
}
