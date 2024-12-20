'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Fleet Manager
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/vehicles"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/vehicles'
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Vehicles
              </Link>
              <Link
                href="/projects"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/projects'
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 