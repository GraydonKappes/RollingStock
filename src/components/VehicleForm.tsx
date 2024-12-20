'use client'

import { useState, useRef } from 'react'
import { Vehicle, VehicleStatus } from '@/types/vehicle'

type VehicleFormProps = {
  initialData?: Partial<Vehicle>
  onSubmit: (data: Omit<Vehicle, 'id' | 'createdAt' | 'assignments'>) => Promise<void>
  onCancel: () => void
}

export default function VehicleForm({ initialData, onSubmit, onCancel }: VehicleFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null)
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Prepare form data for upload
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const { imagePath } = await response.json()
      setFormData(prev => ({ ...prev, imageUrl: imagePath }))
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-h-[80vh] overflow-y-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">VIN</label>
          <input
            type="text"
            value={formData.vin}
            onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Make</label>
          <input
            type="text"
            value={formData.make}
            onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as VehicleStatus }))}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Image</label>
          <div className="space-y-2">
            {imagePreview && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={imagePreview}
                  alt="Vehicle preview"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null)
                    setFormData(prev => ({ ...prev, imageUrl: '' }))
                  }}
                  className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900"
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {initialData ? 'Update' : 'Create'} Vehicle
        </button>
      </div>
    </form>
  )
} 