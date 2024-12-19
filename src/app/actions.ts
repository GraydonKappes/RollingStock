"use server"

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getVehicles() {
  return await prisma.vehicle.findMany({
    include: {
      assignments: {
        include: {
          project: true
        }
      }
    }
  })
}

export async function getCurrentVehicleStatus() {
  return await prisma.vehicle.findMany({
    select: {
      id: true,
      make: true,
      model: true,
      category: true,
      status: true,
      assignments: {
        where: {
          project: {
            status: 'active'
          }
        },
        select: {
          project: {
            select: {
              name: true,
              location: true
            }
          }
        }
      }
    }
  })
} 