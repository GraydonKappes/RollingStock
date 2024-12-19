import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Rolling Stock Management</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link 
            href="/vehicles" 
            className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Vehicle Fleet →</h2>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your entire fleet of vehicles
            </p>
          </Link>
          
          {/* Add more cards for projects and assignments later */}
        </div>
      </main>
    </div>
  )
}
