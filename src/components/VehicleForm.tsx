'use client'

import { useState } from 'react'
import { Vehicle, VehicleStatus } from '@/types/vehicle'

type VehicleFormProps = {
  initialData?: Partial<Vehicle>
  onSubmit: (data: Omit<Vehicle, 'id' | 'createdAt' | 'assignments'>) => Promise<void>
  onCancel: () => void
}

export default function VehicleForm({ initialData, onSubmit, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    vin: initialData?.vin || '',
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    status: initialData?.status || 'active' as VehicleStatus,
    category: initialData?.category || '',
    imageUrl: initialData?.imageUrl || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">VIN</label>
        <input
          type="text"
          value={formData.vin}
          onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Make</label>
        <input
          type="text"
          value={formData.make}
          onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <input
          type="text"
          value={formData.model}
          onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Year</label>
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as VehicleStatus }))}
          className="w-full p-2 border rounded"
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <input
          type="url"
          value={formData.imageUrl || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {initialData ? 'Update' : 'Create'} Vehicle
        </button>
      </div>
    </form>
  )
} 