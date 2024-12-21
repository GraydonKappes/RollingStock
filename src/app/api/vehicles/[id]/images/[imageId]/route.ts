import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { isPrimary } = await request.json()
    const vehicleId = parseInt(params.id)
    
    // If setting as primary, unset any existing primary images first
    if (isPrimary) {
      await sql`
        UPDATE vehicle_images 
        SET is_primary = false 
        WHERE vehicle_id = ${vehicleId}
      `
    }
    
    // Update the specified image
    await sql`
      UPDATE vehicle_images 
      SET is_primary = ${isPrimary}
      WHERE id = ${parseInt(params.imageId)}
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