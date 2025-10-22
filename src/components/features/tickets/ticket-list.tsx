'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketForm } from './ticket-form'
import { TicketEditForm } from './ticket-edit-form'
import { Plus, Edit, Trash2, User, Calendar, Flag, Eye } from 'lucide-react'
import { getStoredTasks, addTask, updateTask, deleteTask, saveTasks, Ticket, resetTasksData } from '@/lib/data-persistence'
import { useUser } from '@/components/providers/user-provider'
import { canDeleteTicket, canEditTicket } from '@/lib/auth-system'

// Utility function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}

interface TicketListProps {
  className?: string
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800'
}

export function TicketList({ className }: TicketListProps) {
  const { user } = useUser()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'review' | 'done'>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingTeams, setLoadingTeams] = useState(false)
  

  useEffect(() => {
    fetchTickets()
    fetchProjects()
    
    // Add persistence verification
    const verifyPersistence = () => {
      const storedTickets = getStoredTasks()
      console.log(`🔍 Persistence check: ${storedTickets.length} tickets in localStorage`)
      
      // Check if we have the expected number of tickets
      if (storedTickets.length > 0) {
        console.log('✅ Tickets are persisting correctly')
      } else {
        console.warn('⚠️ No tickets found in localStorage')
      }
    }
    
    // Run verification after component mounts
    setTimeout(verifyPersistence, 1000)
  }, [])

  // Fetch teams when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchTeams(selectedProject)
    } else {
      setTeams([])
      setSelectedTeam('')
    }
  }, [selectedProject])

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

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      
      // Use requestIdleCallback for non-blocking data loading
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const storedTickets = getStoredTasks()
          console.log(`📋 Loaded ${storedTickets.length} tickets from localStorage`)
          
          const uniqueTickets = storedTickets.filter((ticket, index, self) => 
            index === self.findIndex(t => t.id === ticket.id)
          )
          
          if (uniqueTickets.length !== storedTickets.length) {
            console.warn(`Found ${storedTickets.length - uniqueTickets.length} duplicate tickets, removing duplicates...`)
            // Remove duplicates without resetting all data
            saveTasks(uniqueTickets)
            setTickets(uniqueTickets)
            console.log(`🔄 Removed duplicates, now showing ${uniqueTickets.length} tickets`)
          } else {
            setTickets(uniqueTickets)
            console.log(`✅ Displaying ${uniqueTickets.length} tickets`)
          }
          setIsLoading(false)
        })
      } else {
        // Fallback for browsers without requestIdleCallback
        const storedTickets = getStoredTasks()
        console.log(`📋 Loaded ${storedTickets.length} tickets from localStorage`)
        
        const uniqueTickets = storedTickets.filter((ticket, index, self) => 
          index === self.findIndex(t => t.id === ticket.id)
        )
        
        if (uniqueTickets.length !== storedTickets.length) {
          console.warn(`Found ${storedTickets.length - uniqueTickets.length} duplicate tickets, removing duplicates...`)
          // Remove duplicates without resetting all data
          saveTasks(uniqueTickets)
          setTickets(uniqueTickets)
          console.log(`🔄 Removed duplicates, now showing ${uniqueTickets.length} tickets`)
        } else {
          setTickets(uniqueTickets)
          console.log(`✅ Displaying ${uniqueTickets.length} tickets`)
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setIsLoading(false)
    }
  }

  const handleTicketCreate = (newTicket: Ticket) => {
    // Check if ticket already exists to prevent duplicates
    const existingTicket = tickets.find(t => t.id === newTicket.id)
    if (existingTicket) {
      console.warn('Ticket with this ID already exists, skipping creation')
      return
    }
    
    console.log(`➕ Creating new ticket: ${newTicket.title}`)
    
    // Ticket is already saved to localStorage by the form, just update UI
    console.log('💾 Ticket already saved to localStorage')
    setLastSaved(new Date())
    
    // Add new ticket to the top of the list immediately
    setTickets(prev => [newTicket, ...prev])
    console.log('🎨 Ticket added to UI')
    
    // Optional: Add a subtle animation effect
    setTimeout(() => {
      const ticketElement = document.querySelector(`[data-ticket-id="${newTicket.id}"]`)
      if (ticketElement) {
        ticketElement.classList.add('animate-pulse')
        setTimeout(() => {
          ticketElement.classList.remove('animate-pulse')
        }, 1000)
      }
    }, 100)
  }

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    const ticket = tickets.find(t => t.id === ticketId)
    if (!ticket || !user) {
      console.warn('Cannot change status: ticket or user not found')
      return
    }

    // Check if user can edit this ticket
    if (!canEditTicket(ticket, user)) {
      alert('You can only change the status of tickets you created')
      return
    }

    console.log(`🔄 Updating ticket ${ticketId} status to ${newStatus}`)
    
    // Update localStorage immediately
    updateTask(ticketId, { status: newStatus as Ticket['status'] })
    console.log('💾 Status updated in localStorage')
    setLastSaved(new Date())
    
            // Update UI immediately for instant feedback
            setTickets(prev => prev.map(ticket =>
              ticket.id === ticketId ? {
                ...ticket,
                status: newStatus as Ticket['status'],
                updatedAt: new Date().toISOString(),
                isUpdated: true
              } : ticket
            ))

            console.log('🎨 Status updated in UI')
            
            // Reset the updated flag after 3 seconds
            setTimeout(() => {
              setTickets(prev => prev.map(ticket =>
                ticket.id === ticketId ? {
                  ...ticket,
                  isUpdated: false
                } : ticket
              ))
            }, 3000)
  }

  const handleDeleteTicket = async (ticketId: string) => {
    if (!user) {
      alert('You must be logged in to delete tickets')
      return
    }

    const ticket = tickets.find(t => t.id === ticketId)
    if (!ticket) {
      return
    }

    if (!canDeleteTicket(ticket, user)) {
      alert('You can only delete tickets you created')
      return
    }

    if (!confirm('Are you sure you want to delete this ticket?')) {
      return
    }

    // Remove from localStorage immediately
    deleteTask(ticketId)

    // Remove from UI immediately for instant feedback
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId))
  }

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsViewModalOpen(true)
  }

  const handleEditTicket = (ticket: Ticket) => {
    if (!user) {
      alert('You must be logged in to edit tickets')
      return
    }

    if (!canEditTicket(ticket, user)) {
      alert('You can only edit tickets you created')
      return
    }

    setEditingTicket(ticket)
    setIsEditModalOpen(true)
  }

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    // Update localStorage immediately
    updateTask(updatedTicket.id, updatedTicket)

    // Update UI immediately
    setTickets(prev => prev.map(ticket =>
      ticket.id === updatedTicket.id ? {
        ...updatedTicket,
        updatedAt: new Date().toISOString(),
        isUpdated: true
      } : ticket
    ))

    setIsEditModalOpen(false)
    setEditingTicket(null)
    
    // Reset the updated flag after 3 seconds
    setTimeout(() => {
      setTickets(prev => prev.map(ticket =>
        ticket.id === updatedTicket.id ? {
          ...ticket,
          isUpdated: false
        } : ticket
      ))
    }, 3000)
  }

  const filteredTickets = tickets.filter(ticket => {
    // Filter by status
    if (filter !== 'all') {
      const filterStatus = filter.replace('-', '_').toUpperCase()
      if (ticket.status !== filterStatus) return false
    }

    // Filter by project
    if (selectedProject && ticket.project?.id !== selectedProject) {
      return false
    }

    // Filter by team
    if (selectedTeam && ticket.team?.id !== selectedTeam) {
      return false
    }

    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
      </div>
    )
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tickets</h2>
          <p className="text-gray-600">Manage and track your team's tasks.</p>
          {lastSaved && (
            <p className="text-sm text-green-600">
              💾 Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <TicketForm onTicketCreate={handleTicketCreate} />
      </div>

      {/* Filter controls */}
      <div className="space-y-4 mb-6">
        {/* Project and Team filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="projectFilter" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Filter by Project
            </label>
            <select
              id="projectFilter"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={loadingProjects}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Projects</option>
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

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="teamFilter" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Filter by Team
            </label>
            <select
              id="teamFilter"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              disabled={!selectedProject || loadingTeams}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {loadingTeams && (
              <p className="text-xs text-gray-500 mt-1">Loading teams...</p>
            )}
            {!selectedProject && (
              <p className="text-xs text-gray-500 mt-1">Select a project first</p>
            )}
          </div>
        </div>

        {/* Status filter buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'todo', 'in-progress', 'review', 'done'].map((statusFilter) => (
            <Button
              key={statusFilter}
              variant={filter === statusFilter ? 'default' : 'outline'}
              onClick={() => setFilter(statusFilter as typeof filter)}
              className={filter === statusFilter ? 'bg-primary-purple hover:bg-primary-purple/90 text-white' : ''}
            >
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('-', ' ')}{' '}
              <span className="ml-1 font-normal">
                {statusFilter === 'all'
                  ? filteredTickets.length
                  : filteredTickets.filter(t => t.status === statusFilter.replace('-', '_').toUpperCase()).length}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => {
          const isMyTicket = user && canEditTicket(ticket, user)
          const createdDate = new Date(ticket.createdAt)
          const timeAgo = getTimeAgo(createdDate)
          
          return (
                  <Card
                    key={ticket.id}
                    data-ticket-id={ticket.id}
                    className={`hover:shadow-md transition-all duration-200 h-fit ${
                      ticket.isUpdated ? 'ticket-updated' : ''
                    }`}
                  >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary-purple bg-primary-purple/10 px-2 py-1 rounded">
                      #{ticket.serialNumber}
                    </span>
                    <CardTitle className="text-lg leading-tight">{ticket.title}</CardTitle>
                  </div>
                <div className="flex gap-1">
                  {/* View button - always visible */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleViewTicket(ticket)}
                    title="View ticket details"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  
                  {/* Edit/Delete buttons - only show if user can edit/delete */}
                  {user && canEditTicket(ticket, user) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-pink-600 hover:bg-pink-50"
                      onClick={() => handleEditTicket(ticket)}
                      title="Edit ticket"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  {user && canDeleteTicket(ticket, user) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteTicket(ticket.id)}
                      title="Delete ticket"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {ticket.description && (
                <CardDescription className="text-sm text-gray-600 line-clamp-2">
                  {ticket.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
                      {/* Creation Time */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Created {timeAgo}</span>
                        <span className="text-gray-400">•</span>
                        <span>{createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
                      </div>

              {/* Status and Priority */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[ticket.status]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${priorityColors[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>

              {/* Project and Team Info */}
              <div className="space-y-1">
                {ticket.project && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <span className="truncate">Project: {ticket.project.name}</span>
                  </div>
                )}
                {ticket.team && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span className="truncate">Team: {ticket.team.name}</span>
                  </div>
                )}
              </div>

              {/* People Info */}
              <div className="space-y-1">
                {ticket.createdBy && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="truncate">Created by: {ticket.createdBy.name}</span>
                  </div>
                )}
                {ticket.assignee && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 flex-shrink-0 text-blue-600" />
                    <span className="truncate">Assigned to: {ticket.assignee.name}</span>
                  </div>
                )}
                {ticket.assignedBy && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 flex-shrink-0 text-purple-600" />
                    <span className="truncate">Assigned by: {ticket.assignedBy.name}</span>
                  </div>
                )}
              </div>

              {/* Due Date */}
              {ticket.dueDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Due: {new Date(ticket.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              {/* Status Update Dropdown */}
              <div className="pt-2">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  disabled={!isMyTicket}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple ${
                    isMyTicket ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>
                {!isMyTicket && (
                  <p className="text-xs text-gray-500 mt-1">
                    Only the creator can change status
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Flag className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? 'Create your first ticket to get started'
              : `No tickets in ${filter.replace('-', ' ')} status`
            }
          </p>
          {filter === 'all' && (
            <TicketForm 
              onTicketCreate={handleTicketCreate}
              className="mx-auto"
            />
          )}
        </div>
      )}

      {/* View Ticket Modal */}
      {isViewModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ticket Details</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                {/* Title - Enhanced visibility */}
                <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedTicket.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-primary-purple bg-primary-purple/10 px-2 py-1 rounded">
                      #{selectedTicket.serialNumber}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedTicket.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusColors[selectedTicket.status]}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</h4>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${priorityColors[selectedTicket.priority]}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                {/* People Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Assignee */}
                  {selectedTicket.assignee && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned To</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <User className="h-4 w-4 flex-shrink-0 text-blue-600" />
                        <span className="font-medium">{selectedTicket.assignee.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Created By */}
                  {selectedTicket.createdBy && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created By</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <User className="h-4 w-4 flex-shrink-0 text-green-600" />
                        <span className="font-medium">{selectedTicket.createdBy.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Assigned By */}
                  {selectedTicket.assignedBy && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned By</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <User className="h-4 w-4 flex-shrink-0 text-purple-600" />
                        <span className="font-medium">{selectedTicket.assignedBy.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Due Date */}
                  {selectedTicket.dueDate && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-orange-600" />
                        <span className="font-medium">{new Date(selectedTicket.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-green-600" />
                      <span className="font-medium">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 mt-6 border-t border-gray-200 dark:border-gray-600">
                <Button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1 bg-primary-purple hover:bg-primary-purple/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {isEditModalOpen && editingTicket && (
        <TicketEditForm
          ticket={editingTicket}
          onUpdate={handleUpdateTicket}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingTicket(null)
          }}
        />
      )}
    </div>
  )
}
