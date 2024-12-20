import { neon } from '@neondatabase/serverless'

const sql = (() => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  try {
    return neon(process.env.DATABASE_URL)
  } catch (error) {
    console.error('Failed to initialize database connection:', error)
    throw error
  }
})()

export { sql }