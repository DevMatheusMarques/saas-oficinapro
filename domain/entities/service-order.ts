export interface ServiceOrder {
  id: string
  budgetId?: string
  customerId: string
  motorcycleId: string
  orderNumber: string
  status: "open" | "in_progress" | "waiting_parts" | "completed" | "delivered"
  description?: string
  startDate?: Date
  estimatedCompletion?: Date
  completionDate?: Date
  mechanicId?: string
  totalAmount: number
  notes?: string
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateServiceOrderData {
  budgetId?: string
  customerId: string
  motorcycleId: string
  description?: string
  startDate?: Date
  estimatedCompletion?: Date
  mechanicId?: string
  notes?: string
}
