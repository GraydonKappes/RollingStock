import { NextRequest, NextResponse } from 'next/server'
import { deleteVehicleImage } from '@/app/actions'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = parseInt(params.id)
    if (isNaN(imageId)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 })
    }

    await deleteVehicleImage(imageId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting vehicle image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete image', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
} 