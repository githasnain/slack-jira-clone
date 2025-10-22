'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, FolderOpen, Shield } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: string
  teams: Team[]
}

interface Team {
  id: string
  name: string
  description: string
  projectId: string
}

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: ''
  })
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    projectId: ''
  })
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/role')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role)
        setIsAdmin(data.role === 'ADMIN')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  useEffect(() => {
    if (selectedProject) {
      fetchTeams(selectedProject)
    } else {
      setTeams([])
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeams = async (projectId: string) => {
    try {
      const response = await fetch(`/api/teams?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectForm),
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects(prev => [...prev, newProject])
        setProjectForm({ name: '', description: '' })
        setShowProjectForm(false)
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamForm),
      })

      if (response.ok) {
        const newTeam = await response.json()
        setTeams(prev => [...prev, newTeam])
        setTeamForm({ name: '', description: '', projectId: selectedProject })
        setShowTeamForm(false)
      }
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Access Required</h3>
          <p className="text-gray-500 mb-4">
            Only administrators can manage projects and teams.
          </p>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Current Role: {userRole || 'Unknown'}
          </Badge>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-900">Project Management</h2>
            <Badge variant="default" className="bg-green-600">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>
          <p className="text-gray-600">Create and manage projects and teams.</p>
        </div>
        <Button
          onClick={() => setShowProjectForm(true)}
          className="bg-primary-purple hover:bg-primary-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{project.teams?.length || 0} teams</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProject(project.id)
                    setTeamForm(prev => ({ ...prev, projectId: project.id }))
                    setShowTeamForm(true)
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Project Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Project</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProjectForm(false)}
                >
                  ×
                </Button>
              </div>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Project Name *
                  </label>
                  <Input
                    id="projectName"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Description
                  </label>
                  <textarea
                    id="projectDescription"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter project description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-primary-purple hover:bg-primary-purple/90">
                    Create Project
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProjectForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showTeamForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Team</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTeamForm(false)}
                >
                  ×
                </Button>
              </div>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Team Name *
                  </label>
                  <Input
                    id="teamName"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter team name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Description
                  </label>
                  <textarea
                    id="teamDescription"
                    value={teamForm.description}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter team description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-primary-purple hover:bg-primary-purple/90">
                    Create Team
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTeamForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
