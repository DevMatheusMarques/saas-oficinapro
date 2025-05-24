export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  cpfCnpj?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateCustomerData {
  name: string
  email?: string
  phone?: string
  cpfCnpj?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string
}
