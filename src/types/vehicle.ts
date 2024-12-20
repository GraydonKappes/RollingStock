export type VehicleStatus = 'active' | 'maintenance' | 'retired'
export type ProjectStatus = 'active' | 'completed'

export type Vehicle = {
  id: number
  vin: string
  make: string
  model: string
  year: number
  status: VehicleStatus
  category: string
  imageUrl?: string | null
  createdAt: Date
  assignments: {
    project: {
      id: number
      name: string
      location: string
      status: ProjectStatus
      createdAt: Date
    }
  }[]
} 