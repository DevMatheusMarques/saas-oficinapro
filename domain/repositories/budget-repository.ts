import type { Budget, BudgetLaborItem, BudgetPartItem, CreateBudgetData } from "../entities/budget"

export interface BudgetRepository {
  findAll(): Promise<Budget[]>
  findById(id: string): Promise<Budget | null>
  findByCustomerId(customerId: string): Promise<Budget[]>
  findByStatus(status: Budget["status"]): Promise<Budget[]>
  create(data: CreateBudgetData): Promise<Budget>
  update(id: string, data: Partial<Budget>): Promise<Budget>
  delete(id: string): Promise<void>

  // Items
  getLaborItems(budgetId: string): Promise<BudgetLaborItem[]>
  getPartItems(budgetId: string): Promise<BudgetPartItem[]>
  addLaborItem(item: Omit<BudgetLaborItem, "id" | "createdAt">): Promise<BudgetLaborItem>
  addPartItem(item: Omit<BudgetPartItem, "id" | "createdAt">): Promise<BudgetPartItem>
  updateLaborItem(id: string, data: Partial<BudgetLaborItem>): Promise<BudgetLaborItem>
  updatePartItem(id: string, data: Partial<BudgetPartItem>): Promise<BudgetPartItem>
  deleteLaborItem(id: string): Promise<void>
  deletePartItem(id: string): Promise<void>
}
