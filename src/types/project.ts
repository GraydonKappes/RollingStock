export type ProjectStatus = 'active' | 'completed'

export type Project = {
  id: number
  name: string
  client: string
  location: string
  status: ProjectStatus
  startDate: string | Date
  endDate?: string | Date
  createdAt: Date
  assignments?: {
    id: number
    vehicle: {
      id: number
      make: string
      model: string
      year: number
    }
  }[]
} 