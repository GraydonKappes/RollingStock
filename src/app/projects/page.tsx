'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Project, ProjectStatus } from '@/types/project'
import { Vehicle } from '@/types/vehicle'
import { getProjects, createProject, updateProject, deleteProject, assignVehicleToProject, unassignVehicleFromProject, getAvailableVehicles } from '@/app/actions'
import ProjectForm from '@/components/ProjectForm'
import styles from '@/styles/Table.module.css'
import AssignmentModal from '@/components/AssignmentModal'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [assigningToProject, setAssigningToProject] = useState<Project | null>(null)
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (data: Pick<Project, 'name' | 'location' | 'status'>) => {
    try {
      await createProject(data)
      await loadProjects()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleUpdateProject = async (data: Pick<Project, 'name' | 'location' | 'status'>) => {
    if (!editingProject) return
    try {
      await updateProject(editingProject.id, data)
      await loadProjects()
      setEditingProject(null)
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await deleteProject(id)
      await loadProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleShowAssignModal = async (project: Project) => {
    try {
      const vehicles = await getAvailableVehicles(project.id)
      setAvailableVehicles(vehicles)
      setAssigningToProject(project)
    } catch (error) {
      console.error('Failed to load available vehicles:', error)
    }
  }

  const handleAssignVehicle = async (vehicleId: number) => {
    if (!assigningToProject) return
    
    try {
      await assignVehicleToProject(vehicleId, assigningToProject.id)
      await loadProjects() // Reload projects to show updated assignments
      setAssigningToProject(null)
    } catch (error) {
      console.error('Failed to assign vehicle:', error)
    }
  }

  const handleUnassignVehicle = async (projectId: number, vehicleId: number) => {
    if (!confirm('Are you sure you want to remove this vehicle from the project?')) return
    
    try {
      await unassignVehicleFromProject(vehicleId, projectId)
      await loadProjects()
    } catch (error) {
      console.error('Failed to unassign vehicle:', error)
    }
  }

  const renderAssignments = (project: Project) => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Assigned Vehicles</h4>
        <button
          onClick={() => handleShowAssignModal(project)}
          className="btn btn-primary text-sm"
        >
          Assign Vehicle
        </button>
      </div>
      
      {project.assignments?.length ? (
        <div className="space-y-2">
          {project.assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <span>
                {assignment.vehicle.make} {assignment.vehicle.model} ({assignment.vehicle.year})
              </span>
              <button
                onClick={() => handleUnassignVehicle(project.id, assignment.vehicle.id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No vehicles assigned</p>
      )}
    </div>
  )

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex items-center gap-4">
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
            <button 
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn btn-primary text-sm"
          >
            Add Project
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className={styles.grid}>
          {projects.map((project) => (
            <div key={project.id} className={styles.itemCard}>
              <div className={styles.header}>
                <h3 className={styles.title}>{project.name}</h3>
                <span className={`${styles.statusBadge} ${styles[project.status]}`}>
                  {project.status}
                </span>
              </div>

              <div className={styles.details}>
                <span className={styles.label}>Client</span>
                <span className={styles.value}>{project.client}</span>

                <span className={styles.label}>Start Date</span>
                <span className={styles.value}>
                  {new Date(project.startDate).toLocaleDateString()}
                </span>

                <span className={styles.label}>End Date</span>
                <span className={styles.value}>
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                </span>

                <span className={styles.label}>Vehicles Assigned</span>
                <span className={styles.value}>
                  {project.assignments?.length || 0}
                </span>
              </div>

              {renderAssignments(project)}

              <div className={styles.actions}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="inline-flex items-center justify-center px-3 py-2 w-32 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
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
                    onClick={() => handleDeleteProject(project.id)}
                    className="inline-flex items-center justify-center px-3 py-2 w-32 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 group"
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
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          {projects.map((project) => (
            <div key={project.id} className={styles.listItem}>
              <div className={styles.listItemInfo}>
                <h3 className={styles.title}>{project.name}</h3>
                <span className={styles.value}>{project.client}</span>
              </div>

              <div>
                <span className={styles.value}>
                  {new Date(project.startDate).toLocaleDateString()}
                  {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString()}` : ' (Ongoing)'}
                </span>
              </div>

              <div>
                <span className={`${styles.statusBadge} ${styles[project.status]}`}>
                  {project.status}
                </span>
              </div>

              {renderAssignments(project)}

              <div className={styles.listItemActions}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="inline-flex items-center justify-center px-3 py-2 w-32 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
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
                    onClick={() => handleDeleteProject(project.id)}
                    className="inline-flex items-center justify-center px-3 py-2 w-32 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 group"
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
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit Form */}
      {(isFormOpen || editingProject) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            <ProjectForm
              initialData={editingProject || undefined}
              onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingProject(null)
              }}
            />
          </div>
        </div>
      )}

      {assigningToProject && (
        <AssignmentModal
          project={assigningToProject}
          availableVehicles={availableVehicles}
          onAssign={handleAssignVehicle}
          onClose={() => setAssigningToProject(null)}
        />
      )}
    </div>
  )
} 