import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Upload to Vercel Blob Storage
    const blob = await put(`vehicles/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return NextResponse.json({ imagePath: blob.url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
} 