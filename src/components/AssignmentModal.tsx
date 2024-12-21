'use client'

import { useState } from 'react'
import { Vehicle } from '@/types/vehicle'
import { Project } from '@/types/project'

type AssignmentModalProps = {
  project: Project
  availableVehicles: Vehicle[]
  onAssign: (vehicleId: number) => Promise<void>
  onClose: () => void
}

export default function AssignmentModal({ 
  project, 
  availableVehicles, 
  onAssign, 
  onClose 
}: AssignmentModalProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicleId) return

    setIsLoading(true)
    try {
      await onAssign(Number(selectedVehicleId))
      onClose()
    } catch (error: any) {
      console.error('Failed to assign vehicle:', error)
      alert(error.message || 'Failed to assign vehicle to project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          Assign Vehicle to {project.name}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Vehicle
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value as number | '')}
              className="input"
              required
            >
              <option value="">Select a vehicle...</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !selectedVehicleId}
            >
              {isLoading ? 'Assigning...' : 'Assign Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 