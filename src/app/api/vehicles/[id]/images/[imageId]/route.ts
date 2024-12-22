import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { NeonQueryFunction } from '@neondatabase/serverless'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { isPrimary } = await request.json()
    const vehicleId = parseInt(params.id)
    
    // First unset any existing primary images if setting a new primary
    if (isPrimary) {
      await sql`
        UPDATE vehicle_images 
        SET is_primary = false 
        WHERE vehicle_id = ${vehicleId}
      `
    }
    
    // Then update the specified image
    await sql`
      UPDATE vehicle_images 
      SET is_primary = ${isPrimary}
      WHERE id = ${parseInt(params.imageId)}
      AND vehicle_id = ${vehicleId}
    `
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating vehicle image:', error)
    return NextResponse.json(
      { error: 'Failed to update image', details: error?.message },
      { status: 500 }
    )
  }
} 