import { NextRequest, NextResponse } from 'next/server'
import { addVehicleImage } from '@/app/actions'
import { sql } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First verify the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'vehicle_images'
      );
    `
    
    if (!tableExists[0].exists) {
      console.error('vehicle_images table does not exist!')
      return NextResponse.json(
        { error: 'Database not properly configured' },
        { status: 500 }
      )
    }

    const vehicleId = parseInt(params.id)
    if (isNaN(vehicleId)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 })
    }

    const { url, isPrimary } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Attempting to add image:', { vehicleId, url, isPrimary })

    const imageId = await addVehicleImage(vehicleId, url, isPrimary)
    console.log('Image added successfully:', imageId)

    return NextResponse.json({ id: imageId })
  } catch (error: any) {
    console.error('Error adding vehicle image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add image to vehicle', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
} 