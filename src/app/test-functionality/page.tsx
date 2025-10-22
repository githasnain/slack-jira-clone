'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useUser } from '@/components/providers/user-provider'
import { getStoredTasks, addTask, updateTask, deleteTask, Ticket } from '@/lib/data-persistence'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function TestFunctionalityPage() {
  const { data: session, status } = useSession()
  const { user } = useUser()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [testResults, setTestResults] = useState<string[]>([])
  const [newTicketTitle, setNewTicketTitle] = useState('')

  useEffect(() => {
    loadTickets()
    addResult('🔍 Functionality Test Page Loaded')
  }, [])

  const loadTickets = () => {
    const storedTickets = getStoredTasks()
    setTickets(storedTickets)
    addResult(`📋 Loaded ${storedTickets.length} tickets from localStorage`)
  }

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testTicketCreation = () => {
    if (!user) {
      addResult('❌ Cannot create ticket: User not authenticated')
      return
    }

    const testTicket: Ticket = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serialNumber: 0,
      title: newTicketTitle || `Test Ticket ${Date.now()}`,
      description: 'This is a test ticket for functionality verification',
      status: 'TODO',
      priority: 'MEDIUM',
      assignee: null,
      createdBy: {
        id: user.id,
        name: user.name,
        image: user.image
      },
      project: {
        id: 'test-project',
        name: 'Test Project'
      },
      dueDate: null,
      tags: ['test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isUpdated: false
    }

    try {
      addTask(testTicket)
      addResult(`✅ Ticket created successfully: "${testTicket.title}"`)
      loadTickets()
    } catch (error) {
      addResult(`❌ Failed to create ticket: ${error}`)
    }
  }

  const testTicketUpdate = (ticketId: string) => {
    if (!user) {
      addResult('❌ Cannot update ticket: User not authenticated')
      return
    }

    const ticket = tickets.find(t => t.id === ticketId)
    if (!ticket) {
      addResult('❌ Ticket not found for update')
      return
    }

    if (ticket.createdBy?.id !== user.id) {
      addResult('❌ Cannot update ticket: User is not the creator')
      return
    }

    try {
      updateTask(ticketId, {
        status: 'IN_PROGRESS',
        updatedAt: new Date().toISOString(),
        isUpdated: true
      })
      addResult(`✅ Ticket updated successfully: "${ticket.title}"`)
      loadTickets()
    } catch (error) {
      addResult(`❌ Failed to update ticket: ${error}`)
    }
  }

  const testTicketDeletion = (ticketId: string) => {
    if (!user) {
      addResult('❌ Cannot delete ticket: User not authenticated')
      return
    }

    const ticket = tickets.find(t => t.id === ticketId)
    if (!ticket) {
      addResult('❌ Ticket not found for deletion')
      return
    }

    if (ticket.createdBy?.id !== user.id) {
      addResult('❌ Cannot delete ticket: User is not the creator')
      return
    }

    try {
      deleteTask(ticketId)
      addResult(`✅ Ticket deleted successfully: "${ticket.title}"`)
      loadTickets()
    } catch (error) {
      addResult(`❌ Failed to delete ticket: ${error}`)
    }
  }

  const testMultiUserScenario = () => {
    addResult('🔄 Testing multi-user scenario...')
    
    if (!user) {
      addResult('❌ Cannot test multi-user scenario: User not authenticated')
      return
    }

    // Create test tickets for the current user
    const testTickets = [
      { title: 'Test Ticket 1', description: 'First test ticket' },
      { title: 'Test Ticket 2', description: 'Second test ticket' },
      { title: 'Test Ticket 3', description: 'Third test ticket' }
    ]

    testTickets.forEach((ticketData, index) => {
      const testTicket: Ticket = {
        id: `multi-user-test-${index}-${Date.now()}`,
        serialNumber: 0,
        title: ticketData.title,
        description: ticketData.description,
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: null,
        createdBy: {
          id: user.id,
          name: user.name,
          image: user.image
        },
        project: {
          id: 'multi-user-project',
          name: 'Multi-User Test Project'
        },
        dueDate: null,
        tags: ['multi-user-test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isUpdated: false
      }

      addTask(testTicket)
      addResult(`✅ Created ticket: ${ticketData.title}`)
    })

    loadTickets()
    addResult('✅ Multi-user scenario test completed')
  }

  const clearAllTickets = () => {
    localStorage.removeItem('slack-jira-tasks')
    localStorage.removeItem('slack-jira-serial-counter')
    setTickets([])
    addResult('🗑️ All tickets cleared')
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (status === 'loading') {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 Functionality Test Suite</h1>
      
      {/* Authentication Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔐 Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ Authenticated as: {session.user?.name}</p>
              <p className="text-sm text-gray-600">Email: {session.user?.email}</p>
              <p className="text-sm text-gray-600">User ID: {user?.id}</p>
              <Button onClick={() => signOut()} variant="outline" className="mt-2">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600">❌ Not authenticated</p>
              <Button onClick={() => signIn()} className="mt-2">
                Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🎫 Ticket CRUD Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter ticket title"
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testTicketCreation} disabled={!user}>
              Create Test Ticket
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testMultiUserScenario} variant="outline">
              Test Multi-User Scenario
            </Button>
            <Button onClick={loadTickets} variant="outline">
              Refresh Tickets
            </Button>
            <Button onClick={clearAllTickets} variant="destructive">
              Clear All Tickets
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Tickets */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📋 Current Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-gray-500">No tickets found</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-gray-600">
                      Created by: {ticket.createdBy?.name} | Status: {ticket.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => testTicketUpdate(ticket.id)}
                      disabled={!user || ticket.createdBy?.id !== user.id}
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => testTicketDeletion(ticket.id)}
                      disabled={!user || ticket.createdBy?.id !== user.id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📊 Test Results</CardTitle>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet</p>
            ) : (
              testResults.slice().reverse().map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
