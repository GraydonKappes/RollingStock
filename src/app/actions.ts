"use server"

import { sql } from '@/lib/db'
import { Vehicle } from '@/types/vehicle'

export async function getVehicles(): Promise<Vehicle[]> {
  const rows = await sql`
    SELECT 
      v.*,
      COALESCE(
        json_agg(
          json_build_object(
            'project', json_build_object(
              'id', p.id,
              'name', p.name,
              'location', p.location,
              'status', p.status,
              'createdAt', p.created_at
            )
          )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) as assignments
    FROM vehicles v
    LEFT JOIN assignments a ON v.id = a.vehicle_id
    LEFT JOIN projects p ON a.project_id = p.id
    GROUP BY v.id
  `
  
  // Transform the raw data to match the Vehicle type
  return rows.map(row => ({
    id: row.id,
    vin: row.vin,
    make: row.make,
    model: row.model,
    year: row.year,
    status: row.status,
    category: row.category,
    imageUrl: row.image_url,
    assignments: row.assignments || []
  })) as Vehicle[]
}

export async function getCurrentVehicleStatus() {
  const rows = await sql`
    SELECT 
      v.id,
      v.make,
      v.model,
      v.category,
      v.status,
      COALESCE(
        json_agg(
          json_build_object(
            'project', json_build_object(
              'name', p.name,
              'location', p.location
            )
          )
        ) FILTER (WHERE p.id IS NOT NULL AND p.status = 'active'),
        '[]'
      ) as assignments
    FROM vehicles v
    LEFT JOIN assignments a ON v.id = a.vehicle_id
    LEFT JOIN projects p ON a.project_id = p.id
    GROUP BY v.id, v.make, v.model, v.category, v.status
  `
  return rows
} 