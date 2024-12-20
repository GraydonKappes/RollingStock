import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Create a unique filename
    const timestamp = Date.now()
    const filename = `vehicle-${timestamp}${path.extname(file.name)}`
    
    // Define the path where the image will be saved
    const publicPath = path.join(process.cwd(), 'public', 'images', 'vehicles')
    const filePath = path.join(publicPath, filename)
    
    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Write the file to disk
    await writeFile(filePath, buffer)
    
    // Return the relative path to be stored in the database
    const imagePath = `/images/vehicles/${filename}`
    return NextResponse.json({ imagePath })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
} 