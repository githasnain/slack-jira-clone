'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { addTask, Ticket, generateUniqueId } from '@/lib/data-persistence'
import { useUser } from '@/components/providers/user-provider'

interface TicketFormProps {
  onTicketCreate?: (ticket: any) => void
  className?: string
}

export function TicketForm({ onTicketCreate, className }: TicketFormProps) {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeName: '',
    assignedByName: user?.name || '',
    dueDate: '',
    projectId: '',
    teamId: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingTeams, setLoadingTeams] = useState(false)

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects()
  }, [])

  // Fetch teams when project changes
  useEffect(() => {
    if (formData.projectId) {
      fetchTeams(formData.projectId)
    } else {
      setTeams([])
      setFormData(prev => ({ ...prev, teamId: '' }))
    }
  }, [formData.projectId])

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const fetchTeams = async (projectId: string) => {
    try {
      setLoadingTeams(true)
      const response = await fetch(`/api/teams?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoadingTeams(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Create ticket object immediately for instant UI update
    const ticketId = generateUniqueId()
    const newTicket = {
      id: ticketId,
      serialNumber: 0, // Will be assigned by addTask function
      title: formData.title,
      description: formData.description,
      status: 'TODO' as const,
      priority: formData.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
      assignee: formData.assigneeName ? {
        id: `assignee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.assigneeName,
        image: ''
      } : null,
      createdBy: {
        id: user?.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: user?.name || 'User',
        image: user?.image || ''
      },
      assignedBy: formData.assignedByName ? {
        id: `assigned-by-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.assignedByName,
        image: ''
      } : null,
      project: {
        id: formData.projectId,
        name: projects.find(p => p.id === formData.projectId)?.name || 'Unknown Project'
      },
      team: formData.teamId ? {
        id: formData.teamId,
        name: teams.find(t => t.id === formData.teamId)?.name || 'Unknown Team'
      } : null,
      dueDate: formData.dueDate || null,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isUpdated: false
    }

        // Save to localStorage and update UI through callback
        addTask(newTicket)
        onTicketCreate?.(newTicket)
        
        // Show success feedback
        setTimeout(() => {
          console.log('✅ Ticket created successfully!')
        }, 100)
        
        // Reset form and close modal immediately
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          assigneeName: '',
          assignedByName: user?.name || '',
          dueDate: '',
          projectId: '',
          teamId: ''
        })
        handleClose()
        setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleOpen = () => {
    setIsOpen(true)
    setIsAnimating(true)
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsOpen(false)
    }, 300)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpen}
        className="bg-primary-purple hover:bg-primary-purple/90 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Ticket
      </Button>
    )
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
              isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Ticket</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 hover:bg-gray-100 rounded-full transition-colors"
            >
              ×
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-white dark:text-white mb-1">
                    Ticket Title *
                  </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter ticket title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the ticket details"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Due Date
                </label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Project *
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                  disabled={loadingProjects}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {loadingProjects && (
                  <p className="text-xs text-gray-500 mt-1">Loading projects...</p>
                )}
              </div>

              <div>
                <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Team
                </label>
                <select
                  id="teamId"
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleChange}
                  disabled={!formData.projectId || loadingTeams}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a team (optional)</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {loadingTeams && (
                  <p className="text-xs text-gray-500 mt-1">Loading teams...</p>
                )}
                {!formData.projectId && (
                  <p className="text-xs text-gray-500 mt-1">Select a project first</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="assignedByName" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Assigned By
                </label>
                <Input
                  id="assignedByName"
                  name="assignedByName"
                  value={formData.assignedByName}
                  onChange={handleChange}
                  placeholder="Enter assigner name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="assigneeName" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Assign To
                </label>
                <Input
                  id="assigneeName"
                  name="assigneeName"
                  value={formData.assigneeName}
                  onChange={handleChange}
                  placeholder="Enter assignee name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary-purple hover:bg-primary-purple/90 flex-1 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Ticket'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-primary-purple hover:text-primary-purple"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
