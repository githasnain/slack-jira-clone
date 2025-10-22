'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const MessageList = dynamic(() => import('@/components/features/messaging/message-list').then(mod => ({ default: mod.MessageList })), {
  loading: () => <div className="p-6"><div className="animate-pulse bg-gray-200 h-32 rounded"></div></div>
})

const ProjectBoard = dynamic(() => import('@/components/features/projects/project-board').then(mod => ({ default: mod.ProjectBoard })), {
  loading: () => <div className="p-6"><div className="animate-pulse bg-gray-200 h-32 rounded"></div></div>
})

const TicketList = dynamic(() => import('@/components/features/tickets/ticket-list').then(mod => ({ default: mod.TicketList })), {
  loading: () => <div className="p-6"><div className="animate-pulse bg-gray-200 h-32 rounded"></div></div>
})

const TeamsList = dynamic(() => import('@/components/features/teams/teams-list').then(mod => ({ default: mod.TeamsList })), {
  loading: () => <div className="p-6"><div className="animate-pulse bg-gray-200 h-32 rounded"></div></div>
})
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  FolderKanban, 
  BarChart3, 
  Users,
  Settings,
  Ticket
} from 'lucide-react'

type ViewType = 'messaging' | 'projects' | 'tickets' | 'analytics' | 'team' | 'settings'

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('analytics')

  const renderContent = () => {
    switch (currentView) {
      case 'messaging':
        return <MessageList />
      case 'projects':
        return <ProjectBoard />
      case 'tickets':
        return <TicketList />
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Messages</h3>
                <p className="text-3xl font-bold text-primary-purple">1,234</p>
                <p className="text-sm text-gray-500">+12% from last week</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Projects</h3>
                <p className="text-3xl font-bold text-primary-pink">8</p>
                <p className="text-sm text-gray-500">3 completed this month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Members</h3>
                <p className="text-3xl font-bold text-primary-dark">24</p>
                <p className="text-sm text-gray-500">18 online now</p>
              </div>
            </div>
          </div>
        )
      case 'team':
        return <TeamsList />
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workspace Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Workspace Name</label>
                    <input 
                      type="text" 
                      defaultValue="My Workspace" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                      defaultValue="A collaborative workspace for our team"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <MessageList />
    }
  }

  return (
    <MainLayout title="Dashboard" subtitle="Welcome to your workspace">
      <div className="flex h-full">
        {/* Navigation tabs */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 p-4 flex-shrink-0">
          <nav className="space-y-2">
            <Button
              variant={currentView === 'analytics' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant={currentView === 'projects' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('projects')}
            >
              <FolderKanban className="h-4 w-4 mr-2" />
              Projects
            </Button>
            <Button
              variant={currentView === 'tickets' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('tickets')}
            >
              <Ticket className="h-4 w-4 mr-2" />
              Tickets
            </Button>
            <Button
              variant={currentView === 'messaging' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('messaging')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messaging
            </Button>
            <Button
              variant={currentView === 'team' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('team')}
            >
              <Users className="h-4 w-4 mr-2" />
              Team
            </Button>
            <Button
              variant={currentView === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </nav>
        </div>

            {/* Main content */}
            <div className="flex-1 dark:bg-primary-pink overflow-x-auto">
              {renderContent()}
            </div>
      </div>
    </MainLayout>
  )
}