import { neon } from '@neondatabase/serverless'

// Create a SQL connection
export const sql = neon(process.env.DATABASE_URL!)

// Optional: Add connection validation
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}