export type VehicleStatus = 'active' | 'maintenance' | 'retired'
export type ProjectStatus = 'active' | 'completed'

export type VehicleImage = {
  id: number
  url: string
  isPrimary: boolean
  displayOrder: number
  createdAt: Date
}

export type Vehicle = {
  id: number
  vin: string
  make: string
  model: string
  year: number
  status: VehicleStatus
  category: string
  createdAt: Date
  assignments: Array<{
    project: {
      id: number
      name: string
      location: string
      status: ProjectStatus
      createdAt: Date
    }
  }>
  images: Array<{
    id: number
    url: string
    isPrimary: boolean
    displayOrder?: number
  }>
} 