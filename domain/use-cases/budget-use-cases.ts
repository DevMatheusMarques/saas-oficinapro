import type { Budget, CreateBudgetData } from "../entities/budget"
import type { BudgetRepository } from "../repositories/budget-repository"

export class BudgetUseCases {
  constructor(private budgetRepository: BudgetRepository) {}

  async getAllBudgets(): Promise<Budget[]> {
    return this.budgetRepository.findAll()
  }

  async getBudgetById(id: string): Promise<Budget | null> {
    if (!id) {
      throw new Error("Budget ID is required")
    }
    return this.budgetRepository.findById(id)
  }

  async getBudgetsByCustomer(customerId: string): Promise<Budget[]> {
    if (!customerId) {
      throw new Error("Customer ID is required")
    }
    return this.budgetRepository.findByCustomerId(customerId)
  }

  async getBudgetsByStatus(status: Budget["status"]): Promise<Budget[]> {
    return this.budgetRepository.findByStatus(status)
  }

  async createBudget(data: CreateBudgetData): Promise<Budget> {
    if (!data.customerId) {
      throw new Error("Customer ID is required")
    }

    if (!data.motorcycleId) {
      throw new Error("Motorcycle ID is required")
    }

    if (data.laborItems.length === 0 && data.partItems.length === 0) {
      throw new Error("At least one labor or part item is required")
    }

    // Validate labor items
    for (const item of data.laborItems) {
      if (!item.description.trim()) {
        throw new Error("Labor item description is required")
      }
      if (item.quantity <= 0) {
        throw new Error("Labor item quantity must be greater than 0")
      }
      if (item.unitPrice < 0) {
        throw new Error("Labor item unit price cannot be negative")
      }
    }

    // Validate part items
    for (const item of data.partItems) {
      if (!item.description.trim()) {
        throw new Error("Part item description is required")
      }
      if (item.quantity <= 0) {
        throw new Error("Part item quantity must be greater than 0")
      }
      if (item.unitPrice < 0) {
        throw new Error("Part item unit price cannot be negative")
      }
    }

    return this.budgetRepository.create(data)
  }

  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget> {
    if (!id) {
      throw new Error("Budget ID is required")
    }

    const budget = await this.budgetRepository.findById(id)
    if (!budget) {
      throw new Error("Budget not found")
    }

    return this.budgetRepository.update(id, data)
  }

  async deleteBudget(id: string): Promise<void> {
    if (!id) {
      throw new Error("Budget ID is required")
    }

    const budget = await this.budgetRepository.findById(id)
    if (!budget) {
      throw new Error("Budget not found")
    }

    if (budget.status === "approved" || budget.status === "completed") {
      throw new Error("Cannot delete approved or completed budgets")
    }

    return this.budgetRepository.delete(id)
  }

  async approveBudget(id: string): Promise<Budget> {
    if (!id) {
      throw new Error("Budget ID is required")
    }

    const budget = await this.budgetRepository.findById(id)
    if (!budget) {
      throw new Error("Budget not found")
    }

    if (budget.status !== "pending") {
      throw new Error("Only pending budgets can be approved")
    }

    return this.budgetRepository.update(id, { status: "approved" })
  }

  async rejectBudget(id: string): Promise<Budget> {
    if (!id) {
      throw new Error("Budget ID is required")
    }

    const budget = await this.budgetRepository.findById(id)
    if (!budget) {
      throw new Error("Budget not found")
    }

    if (budget.status !== "pending") {
      throw new Error("Only pending budgets can be rejected")
    }

    return this.budgetRepository.update(id, { status: "rejected" })
  }

  async completeBudget(id: string): Promise<Budget> {
    if (!id) {
      throw new Error("Budget ID is required")
    }

    const budget = await this.budgetRepository.findById(id)
    if (!budget) {
      throw new Error("Budget not found")
    }

    if (budget.status !== "approved") {
      throw new Error("Only approved budgets can be completed")
    }

    return this.budgetRepository.update(id, { status: "completed" })
  }
}
