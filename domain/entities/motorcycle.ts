export interface Motorcycle {
  id: string
  customerId: string
  brand: string
  model: string
  year?: number
  color?: string
  licensePlate?: string
  chassisNumber?: string
  engineNumber?: string
  mileage: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateMotorcycleData {
  customerId: string
  brand: string
  model: string
  year?: number
  color?: string
  licensePlate?: string
  chassisNumber?: string
  engineNumber?: string
  mileage?: number
  notes?: string
}

export interface UpdateMotorcycleData extends Partial<CreateMotorcycleData> {
  id: string
}
