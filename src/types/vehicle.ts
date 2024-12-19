import { vehicle_status } from '@prisma/client'

export type Vehicle = {
  id: number
  vin: string
  make: string
  model: string
  year: number
  status: vehicle_status | null
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