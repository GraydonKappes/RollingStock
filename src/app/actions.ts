"use server"

import { sql } from '@/lib/db'
import { Vehicle, VehicleStatus, ProjectStatus } from '@/types/vehicle'
import { Project } from '@/types/project'

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

export async function createVehicle(data: Omit<Vehicle, 'id' | 'createdAt' | 'assignments'>) {
  const result = await sql`
    INSERT INTO vehicles (
      vin, make, model, year, status, category, image_url
    ) VALUES (
      ${data.vin}, ${data.make}, ${data.model}, ${data.year}, 
      ${data.status}, ${data.category}, ${data.imageUrl}
    )
    RETURNING id
  `
  return result[0].id
}

export async function updateVehicle(id: number, data: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'assignments'>>) {
  const result = await sql`
    UPDATE vehicles 
    SET
      vin = ${data.vin},
      make = ${data.make},
      model = ${data.model},
      year = ${data.year},
      status = ${data.status},
      category = ${data.category},
      image_url = ${data.imageUrl}
    WHERE id = ${id}
    RETURNING id
  `
  return result[0].id
}

export async function deleteVehicle(id: number) {
  await sql`
    DELETE FROM vehicles
    WHERE id = ${id}
  `
  return id
}

export async function getVehicleById(id: number): Promise<Vehicle | null> {
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
    WHERE v.id = ${id}
    GROUP BY v.id
  `
  
  if (!rows.length) return null

  const row = rows[0]
  return {
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
  }
} 

export async function getProjects(): Promise<Project[]> {
  try {
    // Simple query first to verify data exists
    const checkProjects = await sql`
      SELECT COUNT(*) as count FROM projects
    `
    console.log('Project count:', checkProjects[0].count)

    // Basic query without joins to verify project data
    const rows = await sql`
      SELECT 
        p.id,
        p.name,
        p.location,
        p.status::text as status,
        p.created_at,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', v.id,
                'make', v.make,
                'model', v.model,
                'year', v.year,
                'status', v.status
              )
            )
            FROM project_assignments pa
            JOIN vehicles v ON pa.vehicle_id = v.id
            WHERE pa.project_id = p.id
          ),
          '[]'::json
        ) as vehicles
      FROM projects p
      ORDER BY p.created_at DESC
    `
    console.log('Basic projects query result:', JSON.stringify(rows, null, 2))

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      location: row.location,
      status: row.status as ProjectStatus,
      createdAt: new Date(row.created_at),
      vehicles: row.vehicles || []
    }))
  } catch (error) {
    console.error('Database error in getProjects:', error)
    throw error
  }
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'vehicles'>) {
  const result = await sql`
    INSERT INTO projects (name, location, status)
    VALUES (${data.name}, ${data.location}, ${data.status})
    RETURNING id
  `
  return result[0].id
}

export async function updateProject(id: number, data: Partial<Omit<Project, 'id' | 'createdAt' | 'vehicles'>>) {
  const result = await sql`
    UPDATE projects 
    SET
      name = ${data.name},
      location = ${data.location},
      status = ${data.status}
    WHERE id = ${id}
    RETURNING id
  `
  return result[0].id
}

export async function deleteProject(id: number) {
  await sql`
    DELETE FROM projects
    WHERE id = ${id}
  `
  return id
} 