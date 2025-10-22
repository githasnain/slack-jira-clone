'use client'

import { useState } from 'react'
import { 
  Plus, 
  MoreHorizontal, 
  User, 
  Calendar,
  Flag,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  assignee?: {
    name: string
    avatar: string
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in-progress' | 'review' | 'done'
  dueDate?: string
  tags?: string[]
}

interface ProjectBoardProps {
  className?: string
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create modern, responsive landing page design',
    assignee: { name: 'Jane Smith', avatar: 'JS' },
    priority: 'high',
    status: 'in-progress',
    dueDate: '2024-01-15',
    tags: ['design', 'frontend']
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Add login/signup functionality with JWT',
    assignee: { name: 'John Doe', avatar: 'JD' },
    priority: 'urgent',
    status: 'todo',
    dueDate: '2024-01-10',
    tags: ['backend', 'auth']
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints',
    assignee: { name: 'Bob Wilson', avatar: 'BW' },
    priority: 'medium',
    status: 'review',
    dueDate: '2024-01-20',
    tags: ['documentation']
  },
  {
    id: '4',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment',
    priority: 'high',
    status: 'done',
    dueDate: '2024-01-05',
    tags: ['devops']
  }
]

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' }
]

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export function ProjectBoard({ className }: ProjectBoardProps) {
  const [tasks, setTasks] = useState(mockTasks)

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  const moveTask = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
    ))
  }

  return (
    <div className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
          <p className="text-gray-600">Manage and track your team's tasks</p>
        </div>
        <Button className="bg-primary-purple hover:bg-primary-purple/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            {/* Column header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="text-sm text-gray-500">
                {getTasksByStatus(column.id).length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <Card
                  key={task.id}
                  className="p-4 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragEnd={(e) => {
                    // Handle drag and drop logic here
                    console.log('Task moved:', task.id)
                  }}
                >
                  <div className="space-y-3">
                    {/* Task header */}
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {task.title}
                      </h4>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-sm text-gray-600">
                        {task.description}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Task footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Priority */}
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-full font-medium",
                          priorityColors[task.priority]
                        )}>
                          {task.priority}
                        </span>

                        {/* Due date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {task.dueDate}
                          </div>
                        )}
                      </div>

                      {/* Assignee */}
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 bg-primary-purple rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {task.assignee.avatar}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add task button */}
              <Button
                variant="ghost"
                className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-primary-purple hover:bg-primary-purple/5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add task
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
