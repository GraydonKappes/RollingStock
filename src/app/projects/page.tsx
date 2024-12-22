'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Project, ProjectStatus } from '@/types/project'
import { getProjects, createProject, updateProject, deleteProject, unassignVehicle } from '@/app/actions'
import ProjectForm from '@/components/ProjectForm'

type StatusFilter = ProjectStatus | 'all'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

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

  const filteredProjects = projects.filter(project => {
    if (statusFilter === 'all') return true
    return project.status === statusFilter
  })

  const handleCreateProject = async (data: Omit<Project, 'id' | 'createdAt' | 'assignments'>) => {
    try {
      await createProject(data)
      await loadProjects()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleUpdateProject = async (data: Omit<Project, 'id' | 'createdAt' | 'assignments'>) => {
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

  const handleUnassignVehicle = async (projectId: number, vehicleId: number) => {
    try {
      await unassignVehicle(projectId, vehicleId)
      await loadProjects()
    } catch (error) {
      console.error('Failed to unassign vehicle:', error)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4">
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in my-8 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Projects</h1>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn btn-primary"
          >
            Add Project
          </button>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-card rounded-xl p-6 border border-border transition-all duration-200 animate-fade-in flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full
                  ${project.status === 'active' ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary'}`}
                >
                  {project.status}
                </span>
              </div>

              <div className="grid grid-cols-[auto,1fr] gap-3 gap-x-6 text-sm">
                <span className="text-secondary font-medium">Client</span>
                <span className="text-foreground">{project.client || 'N/A'}</span>

                <span className="text-secondary font-medium">Location</span>
                <span className="text-foreground">{project.location}</span>

                <span className="text-secondary font-medium">Start Date</span>
                <span className="text-foreground">
                  {new Date(project.startDate).toLocaleDateString()}
                </span>

                <span className="text-secondary font-medium">End Date</span>
                <span className="text-foreground">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>

              {project.assignments && project.assignments.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-secondary mb-2">Assigned Vehicles</h4>
                  <div className="grid gap-2">
                    {project.assignments.map((assignment) => (
                      <div key={assignment.vehicle.id} className="flex items-center justify-between p-2 bg-background rounded-lg border border-border">
                        <span className="text-sm">
                          {assignment.vehicle.make} {assignment.vehicle.model} ({assignment.vehicle.year})
                        </span>
                        <button
                          onClick={() => handleUnassignVehicle(project.id, assignment.vehicle.id)}
                          className="text-sm text-danger hover:text-opacity-80 transition-colors"
                        >
                          Unassign
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setEditingProject(project)}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-danger bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-danger/10 dark:hover:bg-gray-700 hover:border-danger/20 dark:hover:border-gray-600 transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 mr-2 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {(isFormOpen || editingProject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
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
    </div>
  )
} 