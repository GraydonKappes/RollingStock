'use client'

import { useRef, useState } from 'react'
import { Vehicle, VehicleStatus, VehicleImage } from '@/types/vehicle'
import { Project } from '@/types/project'

type VehicleFormProps = {
  initialData?: Partial<Vehicle>
  onSubmit: (data: Omit<Vehicle, 'id' | 'createdAt' | 'assignments' | 'images'>) => Promise<void>
  onCancel: () => void
  onAssignToProject?: (projectId: number) => Promise<void>
  availableProjects?: Project[]
}

export default function VehicleForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  onAssignToProject,
  availableProjects
}: VehicleFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreviews, setImagePreviews] = useState<{ url: string; isPrimary: boolean; id?: number }[]>(
    initialData?.images?.map(img => ({ 
      url: img.url, 
      isPrimary: img.isPrimary,
      id: img.id 
    })) || []
  )
  const [formData, setFormData] = useState({
    vin: initialData?.vin || '',
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    status: initialData?.status || 'active' as VehicleStatus,
    category: initialData?.category || ''
  })
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const vehicleId = await onSubmit(formData)
      
      // Handle image uploads after vehicle is created/updated
      if (imagePreviews.length > 0) {
        // First, handle new images (ones without IDs)
        const newImages = imagePreviews.filter(preview => !preview.id)
        for (const preview of newImages) {
          try {
            // Create FormData for upload
            const formData = new FormData()
            const response = await fetch(preview.url)
            const blob = await response.blob()
            formData.append('image', blob, 'image.jpg')
            formData.append('isPrimary', preview.isPrimary.toString())
            
            // Upload to blob storage
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            
            if (!uploadResponse.ok) {
              throw new Error('Failed to upload image')
            }

            const { imagePath } = await uploadResponse.json()
            
            // Add the image to the vehicle
            await fetch(`/api/vehicles/${vehicleId}/images`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                url: imagePath,
                isPrimary: preview.isPrimary
              })
            })
          } catch (error) {
            console.error('Failed to process new image:', error)
          }
        }

        // Then, update existing images' primary status
        const existingImages = imagePreviews.filter(preview => preview.id)
        for (const preview of existingImages) {
          try {
            await fetch(`/api/vehicles/${vehicleId}/images/${preview.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                isPrimary: preview.isPrimary
              })
            })
          } catch (error) {
            console.error('Failed to update existing image:', error)
          }
        }
      }
      
      onCancel() // Close the form after successful submission
    } catch (error) {
      console.error('Failed to submit vehicle:', error)
      alert('Failed to save vehicle')
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setIsUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        if (!file.type.startsWith('image/')) {
          alert('Please upload only image files')
          continue
        }

        // Create FormData for upload
        const formData = new FormData()
        formData.append('image', file)
        
        // Set first image as primary by default only if no images exist
        const shouldBePrimary = imagePreviews.length === 0 && i === 0
        formData.append('isPrimary', shouldBePrimary.toString())

        // Upload to blob storage
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const { imagePath } = await response.json()

        // Add to previews without duplicating
        setImagePreviews(prev => {
          // Check if this image URL already exists
          if (prev.some(p => p.url === imagePath)) {
            return prev
          }
          return [...prev, {
            url: imagePath,
            isPrimary: shouldBePrimary
          }]
        })
      }
    } catch (error) {
      console.error('Failed to upload images:', error)
      alert('Failed to upload one or more images')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (index: number) => {
    const preview = imagePreviews[index]
    
    if (preview.id) {
      // This is an existing image, delete from server first
      try {
        const response = await fetch(`/api/images/${preview.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete image')
        }
      } catch (error) {
        console.error('Failed to delete image:', error)
        alert('Failed to delete image')
        return
      }
    }
    
    // Only update local state after successful server deletion or if it's a new image
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index)
      // If we removed the primary image, make the first remaining image primary
      if (preview.isPrimary && newPreviews.length > 0) {
        newPreviews[0].isPrimary = true
      }
      return newPreviews
    })
  }

  const handleSetPrimaryImage = (index: number) => {
    setImagePreviews(prev => 
      prev.map((preview, i) => ({
        ...preview,
        isPrimary: i === index
      }))
    )
  }

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
      <div className="space-y-3">
        {/* VIN */}
        <div>
          <div className="mb-1">VIN</div>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleFieldChange}
            className="w-64 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Make */}
        <div>
          <div className="mb-1">Make</div>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleFieldChange}
            className="w-64 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Model */}
        <div>
          <div className="mb-1">Model</div>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleFieldChange}
            className="w-64 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Year */}
        <div>
          <div className="mb-1">Year</div>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleFieldChange}
            className="w-64 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Category */}
        <div>
          <div className="mb-1">Category</div>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleFieldChange}
            className="w-64 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Status */}
        <div>
          <div className="mb-1">Status</div>
          <select
            name="status"
            value={formData.status}
            onChange={handleFieldChange}
            className="w-64 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        {/* Project Assignment */}
        {onAssignToProject && availableProjects && (
          <div>
            <div className="mb-1">
              Assign to Project
              {initialData?.assignments && initialData.assignments.length > 0 && (
                <span className="text-red-500 ml-2">
                  (Already assigned to {initialData.assignments[0].project.name})
                </span>
              )}
            </div>
            <select
              onChange={(e) => onAssignToProject(Number(e.target.value))}
              className="w-64 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={Boolean(initialData?.assignments && initialData.assignments.length > 0)}
            >
              <option value="">Select a project...</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Images */}
        <div>
          <div className="mb-1">Images</div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="w-64"
            disabled={isUploading}
          />
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-40 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(index)}
                    className={`p-2 rounded ${
                      preview.isPrimary ? 'bg-green-500' : 'bg-blue-500'
                    } text-white text-sm`}
                  >
                    {preview.isPrimary ? 'Primary' : 'Set Primary'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-2 rounded bg-red-500 text-white text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : initialData ? 'Update' : 'Create'} Vehicle
        </button>
      </div>
    </form>
  )
} 