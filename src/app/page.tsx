'use client'

import React, { useEffect } from 'react'
import { testDatabaseConnection } from '@/app/actions'

export default function Home() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        await testDatabaseConnection()
      } catch (error) {
        console.error('Connection test failed:', error)
      }
    }
    testConnection()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Fleet Management</h1>
      {/* Rest of your component */}
    </div>
  )
}
