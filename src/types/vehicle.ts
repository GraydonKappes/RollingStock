export type VehicleStatus = 'active' | 'maintenance' | 'retired' | null

export type Vehicle = {
  id: number
  vin: string
  make: string
  model: string
  year: number
  status: VehicleStatus
  category: string
  imageUrl?: string | null
  assignments: {
    project: {
      id: number
      name: string
      location: string
      status: string
      createdAt: Date | null
    }
  }[]
} 