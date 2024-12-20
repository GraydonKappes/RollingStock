export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default async function Home() {
  console.log('Rendering home page')
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fleet Management System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/vehicles" className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Vehicle Management</h2>
          <p className="text-gray-600 dark:text-gray-300">View and manage your fleet of vehicles.</p>
        </a>

        <a href="/projects" className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Project Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage projects.</p>
        </a>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p className="text-gray-600 dark:text-gray-300">System Online</p>
        </div>
      </div>
    </main>
  )
}
