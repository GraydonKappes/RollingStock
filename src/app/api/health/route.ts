import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT 1 as test`
    return NextResponse.json({ 
      status: 'ok',
      database: 'connected',
      test: result[0].test
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
} 