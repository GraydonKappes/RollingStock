"use server"

import { sql } from '@/lib/db'
import { Vehicle, VehicleStatus, ProjectStatus } from '@/types/vehicle'
import { Project } from '@/types/project'

interface ProjectAssignment {
  project: {
    id: number;
    name: string;
    location: string;
    status: ProjectStatus;
    createdAt: string | Date;
  }
}

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
    assignments: (row.assignments || []).map((assignment: ProjectAssignment) => ({
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
    assignments: (row.assignments || []).map((assignment: ProjectAssignment) => ({
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
    const rows = await sql`
      SELECT 
        p.id,
        p.name,
        p.location,
        p.status,
        p.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pa.id,
              'vehicle', json_build_object(
                'id', v.id,
                'make', v.make,
                'model', v.model,
                'year', v.year
              )
            )
          ) FILTER (WHERE v.id IS NOT NULL),
          '[]'
        ) as assignments
      FROM projects p
      LEFT JOIN project_assignments pa ON p.id = pa.project_id
      LEFT JOIN vehicles v ON pa.vehicle_id = v.id
      GROUP BY p.id, p.name, p.location, p.status, p.created_at
      ORDER BY p.created_at DESC
    `

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      client: 'N/A',
      location: row.location,
      status: row.status as ProjectStatus,
      startDate: row.created_at,
      endDate: undefined,
      createdAt: new Date(row.created_at),
      assignments: row.assignments || []
    }))
  } catch (error) {
    console.error('Database error in getProjects:', error)
    throw error
  }
}

export async function createProject(data: Pick<Project, 'name' | 'location' | 'status'>) {
  const result = await sql`
    INSERT INTO projects (
      name,
      location,
      status
    )
    VALUES (
      ${data.name},
      ${data.location},
      ${data.status}
    )
    RETURNING id
  `
  return result[0].id
}

export async function updateProject(
  id: number, 
  data: Partial<Pick<Project, 'name' | 'location' | 'status'>>
) {
  const result = await sql`
    UPDATE projects 
    SET
      name = COALESCE(${data.name}, name),
      location = COALESCE(${data.location}, location),
      status = COALESCE(${data.status}, status)
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