"use server"

import { sql } from '@/lib/db'
import { Vehicle, VehicleStatus, ProjectStatus } from '@/types/vehicle'
import { Project } from '@/types/project'
import { del } from '@vercel/blob'

interface ProjectAssignment {
  project: {
    id: number;
    name: string;
    location: string;
    status: ProjectStatus;
    createdAt: string | Date;
  }
}

export async function deleteImageFile(url: string) {
  try {
    // Extract the pathname from the URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
    
    // Delete from Vercel Blob storage
    await del(pathname);
  } catch (error) {
    console.error('Failed to delete image file:', error);
    // Don't throw the error - we still want to remove from DB even if blob deletion fails
  }
}

async function getVehiclesImpl(): Promise<Vehicle[]> {
  try {
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
        ) as assignments,
        COALESCE(
          json_agg(
            json_build_object(
              'id', vi.id,
              'url', vi.url,
              'isPrimary', vi.is_primary
            ) ORDER BY vi.display_order
          ) FILTER (WHERE vi.id IS NOT NULL),
          '[]'
        ) as images
      FROM vehicles v
      LEFT JOIN project_assignments pa ON v.id = pa.vehicle_id
      LEFT JOIN projects p ON pa.project_id = p.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `
    return rows.map(row => ({
      id: row.id,
      vin: row.vin,
      make: row.make,
      model: row.model,
      year: row.year,
      status: row.status as VehicleStatus,
      category: row.category,
      images: row.images || [],
      createdAt: new Date(row.created_at),
      assignments: (row.assignments || []).map((assignment: ProjectAssignment) => ({
        project: {
          ...assignment.project,
          status: assignment.project.status as ProjectStatus,
          createdAt: new Date(assignment.project.createdAt)
        }
      }))
    }))
  } catch (error) {
    console.error('Error in getVehicles:', error)
    throw error
  }
}

async function getProjectsImpl(): Promise<Project[]> {
  const rows = await sql`
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'vehicle', json_build_object(
              'id', v.id,
              'make', v.make,
              'model', v.model,
              'year', v.year,
              'status', v.status
            )
          )
        ) FILTER (WHERE v.id IS NOT NULL),
        '[]'
      ) as assignments
    FROM projects p
    LEFT JOIN project_assignments pa ON p.id = pa.project_id
    LEFT JOIN vehicles v ON pa.vehicle_id = v.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    client: row.client || 'N/A',
    location: row.location,
    status: row.status as ProjectStatus,
    startDate: row.start_date || row.created_at,
    endDate: row.end_date,
    createdAt: new Date(row.created_at),
    assignments: (row.assignments || []).map((assignment: any) => ({
      vehicle: {
        id: assignment.vehicle.id,
        make: assignment.vehicle.make,
        model: assignment.vehicle.model,
        year: assignment.vehicle.year,
        status: assignment.vehicle.status as VehicleStatus
      }
    }))
  }))
}

export const getVehicles = getVehiclesImpl
export const getProjects = getProjectsImpl
export const unassignVehicle = async (projectId: number, vehicleId: number) => {
  await sql`
    DELETE FROM project_assignments 
    WHERE project_id = ${projectId} AND vehicle_id = ${vehicleId}
  `
}

export async function getCurrentVehicleStatus() {
  const rows = await sql`
    SELECT * FROM current_vehicle_status
    WHERE status = 'active'
  `
  return rows
} 

export async function createVehicle(data: Omit<Vehicle, 'id' | 'createdAt' | 'assignments' | 'images'>) {
  const result = await sql`
    INSERT INTO vehicles (
      vin, make, model, year, status, category
    ) VALUES (
      ${data.vin}, ${data.make}, ${data.model}, ${data.year}, 
      ${data.status}, ${data.category}
    )
    RETURNING id
  `
  return result[0].id
}

export async function updateVehicle(
  id: number, 
  data: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'assignments' | 'images'>>
) {
  const result = await sql`
    UPDATE vehicles 
    SET
      vin = ${data.vin},
      make = ${data.make},
      model = ${data.model},
      year = ${data.year},
      status = ${data.status},
      category = ${data.category}
    WHERE id = ${id}
    RETURNING id
  `
  
  return result[0].id
}

export async function deleteVehicle(id: number) {
  const images = await sql`
    SELECT url FROM vehicle_images WHERE vehicle_id = ${id}
  `
  
  await sql`DELETE FROM vehicles WHERE id = ${id}`
  
  // Delete all associated image files
  for (const image of images) {
    await deleteImageFile(image.url)
  }
  
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
      ) as assignments,
      COALESCE(
        json_agg(
          json_build_object(
            'id', vi.id,
            'url', vi.url,
            'isPrimary', vi.is_primary,
            'displayOrder', vi.display_order,
            'createdAt', vi.created_at
          ) ORDER BY vi.display_order
        ) FILTER (WHERE vi.id IS NOT NULL),
        '[]'
      ) as images
    FROM vehicles v
    LEFT JOIN project_assignments pa ON v.id = pa.vehicle_id
    LEFT JOIN projects p ON pa.project_id = p.id
    LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
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
    images: row.images || [],
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

export async function assignVehicleToProject(vehicleId: number, projectId: number) {
  try {
    // First remove any existing assignment
    await sql`
      DELETE FROM project_assignments 
      WHERE vehicle_id = ${vehicleId}
    `

    // Then create the new assignment
    const result = await sql`
      INSERT INTO project_assignments (vehicle_id, project_id)
      VALUES (${vehicleId}, ${projectId})
      RETURNING id
    `
    return result[0].id
  } catch (error: any) {
    console.error('Failed to assign vehicle to project:', error)
    throw error
  }
}

export async function getAvailableVehicles(projectId: number): Promise<Vehicle[]> {
  const rows = await sql`
    SELECT 
      v.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', vi.id,
            'url', vi.url,
            'isPrimary', vi.is_primary,
            'displayOrder', vi.display_order,
            'createdAt', vi.created_at
          ) ORDER BY vi.display_order
        ) FILTER (WHERE vi.id IS NOT NULL),
        '[]'
      ) as images
    FROM vehicles v
    LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
    WHERE v.status = 'active'
    AND NOT EXISTS (
      SELECT 1 
      FROM project_assignments pa
      WHERE pa.vehicle_id = v.id
      AND pa.project_id = ${projectId}
    )
    GROUP BY v.id
  `
  
  return rows.map(row => ({
    id: row.id,
    vin: row.vin,
    make: row.make,
    model: row.model,
    year: row.year,
    status: row.status as VehicleStatus,
    category: row.category,
    images: row.images || [],
    createdAt: new Date(row.created_at),
    assignments: []
  }))
} 

export async function addVehicleImage(
  vehicleId: number, 
  url: string, 
  isPrimary: boolean = false
): Promise<number> {
  const result = await sql`
    INSERT INTO vehicle_images (
      vehicle_id, 
      url, 
      is_primary,
      display_order
    ) 
    VALUES (
      ${vehicleId}, 
      ${url}, 
      ${isPrimary},
      (
        SELECT COALESCE(MAX(display_order) + 1, 0)
        FROM vehicle_images
        WHERE vehicle_id = ${vehicleId}
      )
    )
    RETURNING id
  `
  return result[0].id
}

export async function deleteVehicleImage(imageId: number) {
  try {
    // First get the image URL
    const image = await sql`
      SELECT url FROM vehicle_images WHERE id = ${imageId}
    `;
    
    if (image?.[0]?.url) {
      await deleteImageFile(image[0].url);
    }
    
    // Then delete from database
    await sql`DELETE FROM vehicle_images WHERE id = ${imageId}`;
  } catch (error) {
    console.error('Error in deleteVehicleImage:', error);
    throw error;
  }
} 

export async function debugDatabase() {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `
  console.log('Available tables:', tables.map(t => t.table_name))

  if (tables.some(t => t.table_name === 'vehicle_images')) {
    const images = await sql`SELECT * FROM vehicle_images;`
    console.log('Vehicle images:', images)
  }
} 

export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT NOW()`
    console.log('Database connection successful:', result)
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
} 