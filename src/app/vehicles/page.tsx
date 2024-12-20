'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Vehicle } from '@/types/vehicle'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/app/actions'
import VehicleForm from '@/components/VehicleForm'
import styles from '@/styles/Table.module.css'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Load vehicles on mount
  useEffect(() => {
    loadVehicles()
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

  const handleCreateVehicle = async (data: Omit<Vehicle, 'id' | 'createdAt' | 'assignments'>) => {
    try {
      await createVehicle(data)
      await loadVehicles()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to create vehicle:', error)
    }
  }

  const handleUpdateVehicle = async (data: Omit<Vehicle, 'id' | 'createdAt' | 'assignments'>) => {
    if (!editingVehicle) return
    try {
      await updateVehicle(editingVehicle.id, data)
      await loadVehicles()
      setEditingVehicle(null)
    } catch (error) {
      console.error('Failed to update vehicle:', error)
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container">
      <div className={styles.tableContainer}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <button 
            onClick={() => setIsFormOpen(true)} 
            className="btn btn-primary"
          >
            Add Vehicle
          </button>
        </div>

        {viewMode === 'grid' ? (
          <div className={styles.grid}>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className={styles.itemCard}>
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
            {vehicles.map((vehicle) => (
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
            />
          </div>
        </div>
      )}
    </div>
  )
} 