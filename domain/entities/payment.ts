export interface Payment {
  id: string
  customerId: string
  serviceOrderId?: string
  budgetId?: string
  amount: number
  paymentType: "cash" | "card" | "pix" | "bank_transfer"
  paymentDate: Date
  description?: string
  referenceNumber?: string
  createdAt: Date
}

export interface CreatePaymentData {
  customerId: string
  serviceOrderId?: string
  budgetId?: string
  amount: number
  paymentType: "cash" | "card" | "pix" | "bank_transfer"
  paymentDate: Date
  description?: string
  referenceNumber?: string
}

export interface AccountPayable {
  id: string
  supplierName: string
  description?: string
  amount: number
  dueDate: Date
  paymentDate?: Date
  status: "pending" | "paid" | "overdue"
  referenceNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateAccountPayableData {
  supplierName: string
  description?: string
  amount: number
  dueDate: Date
  referenceNumber?: string
  notes?: string
}
