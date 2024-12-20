export type Project = {
  id: number
  name: string
  location: string
  status: 'active' | 'completed'
  createdAt: Date
  vehicles?: {
    id: number
    make: string
    model: string
    year: number
    status: string
  }[]
} 