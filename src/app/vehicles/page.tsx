'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Vehicle, VehicleStatus } from '@/types/vehicle'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getProjects, assignVehicleToProject } from '@/app/actions'
import VehicleForm from '@/components/VehicleForm'
import styles from '@/styles/Table.module.css'
import { Project } from '@/types/project'
import ImageCarousel from '@/components/ImageCarousel'

// Add new type for extended status filter
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
      return id // Return the ID for image handling
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
      return id // Return the ID for image handling
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
    <div className="container">
      <div className={styles.tableContainer}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Vehicles</h1>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ExtendedStatusFilter)}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
              <option value="unassigned-active">Unassigned Active</option>
            </select>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)} 
            className="btn btn-primary"
          >
            Add Vehicle
          </button>
        </div>

        {viewMode === 'grid' ? (
          <div className={styles.grid}>
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className={styles.itemCard}>
                {vehicle.images.length > 0 && (
                  <div className={styles.imageContainer}>
                    <ImageCarousel 
                      images={vehicle.images} 
                      altText={`${vehicle.make} ${vehicle.model}`} 
                    />
                  </div>
                )}
                <div className={styles.header}>
                  <h3 className={styles.title}>
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </h3>
                  <span className={`${styles.statusBadge} ${styles[vehicle.status]}`}>
                    {vehicle.status}
                  </span>
                </div>
                
                <div className={styles.details}>
                  <span className={styles.label}>VIN</span>
                  <span className={styles.value}>{vehicle.vin}</span>
                  
                  <span className={styles.label}>Category</span>
                  <span className={styles.value}>{vehicle.category}</span>
                  
                  <span className={styles.label}>Project</span>
                  <span className={styles.value}>
                    {vehicle.assignments?.[0]?.project?.name || 'Unassigned'}
                  </span>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => setEditingVehicle(vehicle)}
                    className={styles.buttonPrimary}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className={styles.buttonDanger}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className={styles.listItem}>
                <div className={styles.listItemInfo}>
                  <h3 className={styles.title}>
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </h3>
                  <span className={styles.value}>{vehicle.vin}</span>
                </div>
                
                <div>
                  <span className={styles.label}>Category</span>
                  <span className={styles.value}>{vehicle.category}</span>
                </div>

                <div>
                  <span className={`${styles.statusBadge} ${styles[vehicle.status]}`}>
                    {vehicle.status}
                  </span>
                </div>

                <div className={styles.listItemActions}>
                  <button
                    onClick={() => setEditingVehicle(vehicle)}
                    className={styles.buttonPrimary}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className={styles.buttonDanger}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal Form */}
      {(isFormOpen || editingVehicle) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>
            <VehicleForm
              initialData={editingVehicle || undefined}
              onSubmit={editingVehicle ? handleUpdateVehicle : handleCreateVehicle}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingVehicle(null)
              }}
              availableProjects={availableProjects}
              onAssignToProject={
                editingVehicle 
                  ? (projectId) => handleAssignToProject(editingVehicle.id, projectId)
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  )
} 