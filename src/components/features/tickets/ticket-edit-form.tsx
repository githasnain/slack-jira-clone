'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

interface Ticket {
  id: string
  serialNumber: number
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignee?: {
    id: string
    name: string
    image?: string
  } | null
  createdBy?: {
    id: string
    name: string
    image?: string
  }
  assignedBy?: {
    id: string
    name: string
    image?: string
  } | null
  project?: {
    id: string
    name: string
  }
  team?: {
    id: string
    name: string
  } | null
  dueDate?: string | null
  tags?: string[]
  createdAt: string
  updatedAt: string
  isUpdated?: boolean
}

interface TicketEditFormProps {
  ticket: Ticket
  onUpdate: (updatedTicket: Ticket) => void
  onClose: () => void
}

export function TicketEditForm({ ticket, onUpdate, onClose }: TicketEditFormProps) {
  const [formData, setFormData] = useState({
    title: ticket.title,
    description: ticket.description || '',
    priority: ticket.priority,
    assigneeName: ticket.assignee?.name || '',
    assignedByName: ticket.assignedBy?.name || '',
    dueDate: ticket.dueDate || '',
    status: ticket.status
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Create updated ticket object
    const updatedTicket: Ticket = {
      ...ticket,
      title: formData.title,
      description: formData.description,
      priority: formData.priority as any,
      status: formData.status as any,
      assignee: formData.assigneeName ? {
        id: ticket.assignee?.id || `assignee-${Date.now()}`,
        name: formData.assigneeName,
        image: ticket.assignee?.image || ''
      } : null,
      createdBy: {
        id: ticket.createdBy?.id || `user-${Date.now()}`,
        name: ticket.createdBy?.name || '',
        image: ticket.createdBy?.image || ''
      },
      assignedBy: formData.assignedByName ? {
        id: ticket.assignedBy?.id || `assigned-by-${Date.now()}`,
        name: formData.assignedByName,
        image: ticket.assignedBy?.image || ''
      } : null,
      dueDate: formData.dueDate || null,
      updatedAt: new Date().toISOString()
    }

    // Update UI immediately
    onUpdate(updatedTicket)
    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Ticket</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Ticket Title Display */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {ticket.title}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Ticket Title *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter ticket title"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple hover:border-primary-purple/50 transition-colors dark:bg-gray-700 dark:text-white"
              />
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
                    Updating...
                  </div>
                ) : (
                  'Update Ticket'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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

