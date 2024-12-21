import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const isPrimary = formData.get('isPrimary') === 'true'
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Get file extension
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`

    // Upload to Vercel Blob Storage
    const blob = await put(`vehicles/${fileName}`, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ 
      imagePath: blob.url,
      isPrimary 
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
} 