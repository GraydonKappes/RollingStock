'use client'

import { useState } from 'react'
import { Project } from '@/types/project'

type ProjectFormProps = {
  initialData?: Partial<Project>
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'vehicles'>) => Promise<void>
  onCancel: () => void
}

export default function ProjectForm({ initialData, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    location: initialData?.location || '',
    status: initialData?.status || 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'completed' }))}
          className="w-full p-2 border rounded"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
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
          {initialData ? 'Update' : 'Create'} Project
        </button>
      </div>
    </form>
  )
} 