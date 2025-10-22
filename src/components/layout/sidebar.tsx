'use client'

import { useState } from 'react'
import { 
  MessageSquare, 
  FolderKanban, 
  Users, 
  Settings, 
  Plus,
  Hash,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    channels: true,
    projects: true,
    directMessages: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const channels = [
    { id: 'general', name: 'general', unread: 3 },
    { id: 'random', name: 'random', unread: 0 },
    { id: 'announcements', name: 'announcements', unread: 1 },
  ]

  const projects = [
    { id: 'web-app', name: 'Web Application', status: 'active' },
    { id: 'mobile-app', name: 'Mobile App', status: 'planning' },
    { id: 'api', name: 'API Development', status: 'active' },
  ]

  const directMessages = [
    { id: 'john', name: 'John Doe', status: 'online' },
    { id: 'jane', name: 'Jane Smith', status: 'away' },
    { id: 'bob', name: 'Bob Wilson', status: 'offline' },
  ]

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-dark dark:text-white">
            Workspace
          </h1>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Channels Section */}
        <div>
          <button
            onClick={() => toggleSection('channels')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white mb-2"
          >
            <span className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Channels
            </span>
            {expandedSections.channels ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.channels && (
            <div className="space-y-1 ml-6">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  className="flex items-center justify-between w-full text-sm text-gray-600 dark:text-white hover:text-gray-900 hover:bg-gray-50 rounded px-2 py-1"
                >
                  <span>#{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="bg-primary-pink text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
              <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-white hover:text-gray-700 px-2 py-1">
                <Plus className="h-3 w-3" />
                Add channel
              </button>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div>
          <button
            onClick={() => toggleSection('projects')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 mb-2"
          >
            <span className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects
            </span>
            {expandedSections.projects ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.projects && (
            <div className="space-y-1 ml-6">
              {projects.map((project) => (
                <button
                  key={project.id}
                  className="flex items-center justify-between w-full text-sm text-gray-600 dark:text-white hover:text-gray-900 hover:bg-gray-50 rounded px-2 py-1"
                >
                  <span>{project.name}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    project.status === 'active' 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  )}>
                    {project.status}
                  </span>
                </button>
              ))}
              <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-white hover:text-gray-700 px-2 py-1">
                <Plus className="h-3 w-3" />
                New project
              </button>
            </div>
          )}
        </div>

        {/* Direct Messages Section */}
        <div>
          <button
            onClick={() => toggleSection('directMessages')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 mb-2"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Direct Messages
            </span>
            {expandedSections.directMessages ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.directMessages && (
            <div className="space-y-1 ml-6">
              {directMessages.map((user) => (
                <button
                  key={user.id}
                  className="flex items-center gap-2 w-full text-sm text-gray-600 dark:text-white hover:text-gray-900 hover:bg-gray-50 rounded px-2 py-1"
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-primary-purple rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                      user.status === 'online' && "bg-green-500",
                      user.status === 'away' && "bg-yellow-500",
                      user.status === 'offline' && "bg-gray-400"
                    )} />
                  </div>
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
            <p className="text-xs text-gray-500 dark:text-white">Online</p>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
