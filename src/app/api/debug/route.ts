import { debugDatabase } from '@/app/actions'
import { NextResponse } from 'next/server'

export async function GET() {
  await debugDatabase()
  return NextResponse.json({ message: 'Check server logs' })
} 