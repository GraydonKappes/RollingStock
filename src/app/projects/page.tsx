'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Project, ProjectStatus } from '@/types/project'
import { getProjects, createProject, updateProject, deleteProject } from '@/app/actions'
import ProjectForm from '@/components/ProjectForm'
import styles from '@/styles/Table.module.css'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container">
      <div className={styles.tableContainer}>
        <div className="flex justify-between items-center mb-6">
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
          <button onClick={() => setIsFormOpen(true)} className={styles.buttonPrimary}>
            Add Project
          </button>
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

                <div className={styles.actions}>
                  <button
                    onClick={() => setEditingProject(project)}
                    className={styles.buttonPrimary}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
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

                <div className={styles.listItemActions}>
                  <button
                    onClick={() => setEditingProject(project)}
                    className={styles.buttonPrimary}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
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

      {/* Modal for Create/Edit Form */}
      {(isFormOpen || editingProject) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
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