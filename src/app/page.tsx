'use client'

import { Suspense } from 'react'
import Error from './error'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fleet Management System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a 
          href="/vehicles" 
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Vehicle Management</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage your fleet of vehicles, including status updates and assignments.
          </p>
        </a>

        <a 
          href="/projects" 
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Project Management</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage projects and vehicle assignments.
          </p>
        </a>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
          <ul className="space-y-2">
            <li className="text-gray-600 dark:text-gray-300">Active Vehicles: Coming soon</li>
            <li className="text-gray-600 dark:text-gray-300">Active Projects: Coming soon</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
