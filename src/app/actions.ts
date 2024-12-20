"use server"

import { sql } from '@/lib/db'
import { Vehicle, VehicleStatus, ProjectStatus } from '@/types/vehicle'

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
    LEFT JOIN project_assignments pa ON v.id = pa.vehicle_id
    LEFT JOIN projects p ON pa.project_id = p.id
    GROUP BY 
      v.id, 
      v.vin, 
      v.make, 
      v.model, 
      v.year, 
      v.status, 
      v.category, 
      v.image_url,
      v.created_at
  `
  
  return rows.map(row => ({
    id: row.id,
    vin: row.vin,
    make: row.make,
    model: row.model,
    year: row.year,
    status: row.status as VehicleStatus,
    category: row.category,
    imageUrl: row.image_url,
    createdAt: new Date(row.created_at),
    assignments: (row.assignments || []).map((assignment: any) => ({
      project: {
        ...assignment.project,
        status: assignment.project.status as ProjectStatus,
        createdAt: new Date(assignment.project.createdAt)
      }
    }))
  }))
}

export async function getCurrentVehicleStatus() {
  const rows = await sql`
    SELECT * FROM current_vehicle_status
    WHERE status = 'active'
  `
  return rows
} 