'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Vehicle, VehicleStatus } from '@/types/vehicle'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getProjects, assignVehicleToProject, deleteVehicleImage } from '@/app/actions'
import VehicleForm from '@/components/VehicleForm'
import { Project } from '@/types/project'
import ImageCarousel from '@/components/ImageCarousel'

// Remove styles import and use Tailwind classes

type ExtendedStatusFilter = VehicleStatus | 'all' | 'unassigned-active'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [statusFilter, setStatusFilter] = useState<ExtendedStatusFilter>('all')

  // Load vehicles on mount
  useEffect(() => {
    loadVehicles()
  }, [])

  // Add this effect to load projects
  useEffect(() => {
    loadProjects()
  }, [])

  async function loadVehicles() {
    try {
      const data = await getVehicles()
      setVehicles(data)
    } catch (error) {
      console.error('Failed to load vehicles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadProjects() {
    try {
      const data = await getProjects()
      setAvailableProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const handleCreateVehicle = async (data: Omit<Vehicle, 'id' | 'createdAt' | 'assignments' | 'images'>) => {
    try {
      const id = await createVehicle(data)
      await loadVehicles()
      setIsFormOpen(false)
      return id
    } catch (error) {
      console.error('Failed to create vehicle:', error)
      throw error
    }
  }

  const handleUpdateVehicle = async (data: Omit<Vehicle, 'id' | 'createdAt' | 'assignments' | 'images'>) => {
    if (!editingVehicle) return
    try {
      const id = await updateVehicle(editingVehicle.id, data)
      await loadVehicles()
      setEditingVehicle(null)
      return id
    } catch (error) {
      console.error('Failed to update vehicle:', error)
      throw error
    }
  }

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    try {
      await deleteVehicle(id)
      await loadVehicles()
    } catch (error) {
      console.error('Failed to delete vehicle:', error)
    }
  }

  const handleAssignToProject = async (vehicleId: number, projectId: number) => {
    try {
      await assignVehicleToProject(vehicleId, projectId)
      await loadVehicles() // Reload to show updated assignments
      setEditingVehicle(null) // Close the modal
    } catch (error) {
      console.error('Failed to assign vehicle to project:', error)
      alert('Failed to assign vehicle to project')
    }
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    switch (statusFilter) {
      case 'unassigned-active':
        return vehicle.status === 'active' && (!vehicle.assignments || vehicle.assignments.length === 0)
      case 'all':
        return true
      default:
        return vehicle.status === statusFilter
    }
  })

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4">
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in my-8 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Vehicles</h1>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ExtendedStatusFilter)}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
              <option value="unassigned-active">Unassigned Active</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button 
                className={`px-4 py-2 text-sm font-medium transition-colors
                  ${viewMode === 'grid' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium transition-colors
                  ${viewMode === 'list' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                onClick={() => setViewMode('list')}
              >
                List View
              </button>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn btn-primary"
            >
              Add Vehicle
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-card rounded-xl p-6 border border-border transition-all duration-200 animate-fade-in flex flex-col gap-4 overflow-hidden hover:-translate-y-1 hover:shadow-md">
                <div className="relative -mx-6 -mt-6 mb-4">
                  <ImageCarousel 
                    images={vehicle.images.map(img => ({
                      id: img.id,
                      url: img.url,
                      isPrimary: img.isPrimary
                    }))}
                    onImageDelete={async (imageId) => {
                      try {
                        await deleteVehicleImage(imageId)
                        await loadVehicles()
                      } catch (error) {
                        console.error('Failed to delete image:', error)
                      }
                    }}
                  />
                </div>

                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full
                    ${vehicle.status === 'active' ? 'bg-success/10 text-success' :
                      vehicle.status === 'maintenance' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'}`}>
                    {vehicle.status}
                  </span>
                </div>

                <div className="grid grid-cols-[auto,1fr] gap-3 gap-x-6 text-sm">
                  <span className="text-secondary font-medium">VIN</span>
                  <span className="text-foreground">{vehicle.vin}</span>

                  <span className="text-secondary font-medium">Category</span>
                  <span className="text-foreground">{vehicle.category}</span>
                </div>

                <div className="grid grid-cols-[auto,1fr] gap-3 gap-x-6 text-sm">
                  <span className="text-secondary font-medium">Project</span>
                  <span className="text-foreground">
                    {vehicle.assignments?.[0]?.project?.name || 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingVehicle(vehicle)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
                  >
                    <svg 
                      className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 group"
                  >
                    <svg 
                      className="w-4 h-4 mr-2 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-card rounded-xl p-6 border border-border flex items-center justify-between gap-4">
                <div className="flex-grow grid grid-cols-[1fr,auto,auto] gap-x-8 gap-y-2 items-center">
                  {/* Vehicle Info */}
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-foreground">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </h3>
                    <span className="text-sm text-secondary">VIN: {vehicle.vin}</span>
                  </div>

                  {/* Category & Project */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                      {vehicle.category || 'Uncategorized'}
                    </span>
                    <span className="text-sm text-secondary">
                      {vehicle.assignments?.[0]?.project?.name 
                        ? `Assigned to: ${vehicle.assignments[0].project.name}`
                        : 'Unassigned'
                      }
                    </span>
                  </div>

                  {/* Status */}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap
                    ${vehicle.status === 'active' ? 'bg-success/10 text-success' :
                      vehicle.status === 'maintenance' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'}`}>
                    {vehicle.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingVehicle(vehicle)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
                  >
                    <svg 
                      className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 group"
                  >
                    <svg 
                      className="w-4 h-4 mr-2 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal */}
      {(isFormOpen || editingVehicle) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>
            <VehicleForm
              initialData={editingVehicle || undefined}
              onSubmit={async (data) => {
                const id = await (editingVehicle ? handleUpdateVehicle(data) : handleCreateVehicle(data))
                return id
              }}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingVehicle(null)
              }}
              availableProjects={availableProjects}
              onAssignToProject={
                editingVehicle 
                  ? async (projectId) => {
                      await handleAssignToProject(editingVehicle.id, projectId)
                      await loadVehicles()
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  )
} 