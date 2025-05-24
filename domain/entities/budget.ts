export interface Budget {
  id: string
  customerId: string
  motorcycleId: string
  budgetNumber: string
  status: "draft" | "pending" | "approved" | "rejected" | "completed"
  description?: string
  laborTotal: number
  partsTotal: number
  discount: number
  totalAmount: number
  validUntil?: Date
  notes?: string
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface BudgetLaborItem {
  id: string
  budgetId: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
}

export interface BudgetPartItem {
  id: string
  budgetId: string
  partId?: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
}

export interface CreateBudgetData {
  customerId: string
  motorcycleId: string
  description?: string
  validUntil?: Date
  notes?: string
  laborItems: Omit<BudgetLaborItem, "id" | "budgetId" | "createdAt">[]
  partItems: Omit<BudgetPartItem, "id" | "budgetId" | "createdAt">[]
}
