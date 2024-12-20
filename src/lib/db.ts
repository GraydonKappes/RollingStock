import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

// Create a SQL connection with proper date handling
export const sql = neon(process.env.DATABASE_URL)