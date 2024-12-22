'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="bg-background border-b border-border">
      <div className="flex items-center h-16 px-4">
        <Link href="/" className="text-xl font-bold text-primary hover:text-primary-hover transition-colors">
          Fleet Manager
        </Link>
        <div className="ml-10 flex gap-4">
          <Link
            href="/vehicles"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${pathname === '/vehicles' 
                ? 'bg-primary/10 text-primary' 
                : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            Vehicles
          </Link>
          <Link
            href="/projects"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${pathname === '/projects' 
                ? 'bg-primary/10 text-primary' 
                : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            Projects
          </Link>
        </div>
      </div>
    </nav>
  )
} 