'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserPlus, 
  Crown, 
  Code, 
  Server, 
  Settings, 
  Megaphone, 
  UserCheck, 
  Palette, 
  Brain, 
  Smartphone,
  Plus,
  MoreHorizontal
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  status: 'online' | 'away' | 'offline'
  isProjectManager?: boolean
}

interface Team {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  projectManager: TeamMember
  members: TeamMember[]
  totalMembers: number
  activeProjects: number
}

interface TeamsListProps {
  className?: string
}

const teamsData: Team[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'User interface and user experience development',
    icon: <Code className="h-5 w-5" />,
    color: 'bg-blue-500',
    projectManager: {
      id: 'pm1',
      name: 'Sarah Johnson',
      role: 'Frontend Lead',
      avatar: 'SJ',
      status: 'online',
      isProjectManager: true
    },
    members: [
      { id: 'f1', name: 'Alex Chen', role: 'React Developer', avatar: 'AC', status: 'online' },
      { id: 'f2', name: 'Emma Wilson', role: 'Vue.js Developer', avatar: 'EW', status: 'away' },
      { id: 'f3', name: 'Mike Davis', role: 'Angular Developer', avatar: 'MD', status: 'online' },
      { id: 'f4', name: 'Lisa Brown', role: 'UI Developer', avatar: 'LB', status: 'online' }
    ],
    totalMembers: 5,
    activeProjects: 3
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Server-side development and API design',
    icon: <Server className="h-5 w-5" />,
    color: 'bg-green-500',
    projectManager: {
      id: 'pm2',
      name: 'David Rodriguez',
      role: 'Backend Lead',
      avatar: 'DR',
      status: 'online',
      isProjectManager: true
    },
    members: [
      { id: 'b1', name: 'Jennifer Lee', role: 'Node.js Developer', avatar: 'JL', status: 'online' },
      { id: 'b2', name: 'Tom Anderson', role: 'Python Developer', avatar: 'TA', status: 'away' },
      { id: 'b3', name: 'Rachel Green', role: 'Java Developer', avatar: 'RG', status: 'online' },
      { id: 'b4', name: 'Chris Taylor', role: 'Go Developer', avatar: 'CT', status: 'offline' }
    ],
    totalMembers: 5,
    activeProjects: 4
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Infrastructure and deployment automation',
    icon: <Settings className="h-5 w-5" />,
    color: 'bg-purple-500',
    projectManager: {
      id: 'pm3',
      name: 'Michael Kim',
      role: 'DevOps Lead',
      avatar: 'MK',
      status: 'online',
      isProjectManager: true
    },
    members: [
      { id: 'd1', name: 'Amanda White', role: 'Cloud Engineer', avatar: 'AW', status: 'online' },
      { id: 'd2', name: 'James Wilson', role: 'Kubernetes Specialist', avatar: 'JW', status: 'away' },
      { id: 'd3', name: 'Sophie Martin', role: 'AWS Engineer', avatar: 'SM', status: 'online' }
    ],
    totalMembers: 4,
    activeProjects: 2
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Brand promotion and customer acquisition',
    icon: <Megaphone className="h-5 w-5" />,
    color: 'bg-pink-500',
    projectManager: {
      id: 'pm4',
      name: 'Jessica Adams',
      role: 'Marketing Director',
      avatar: 'JA',
      status: 'online',
      isProjectManager: true
    },
    members: [
      { id: 'm1', name: 'Kevin Park', role: 'Digital Marketing', avatar: 'KP', status: 'online' },
      { id: 'm2', name: 'Nina Garcia', role: 'Content Creator', avatar: 'NG', status: 'away' },
      { id: 'm3', name: 'Ryan Murphy', role: 'SEO Specialist', avatar: 'RM', status: 'online' }
    ],
    totalMembers: 4,
    activeProjects: 5
  },
  {
    id: 'hr',
    name: 'HR',
    description: 'Human resources and talent management',
    icon: <UserCheck className="h-5 w-5" />,
    color: 'bg-orange-500',
    projectManager: {
      id: 'pm5',
      name: 'Patricia Clark',
      role: 'HR Director',
      avatar: 'PC',
      status: 'online',
      isProjectManager: true
    },
    members: [
      { id: 'h1', name: 'Daniel Kim', role: 'Recruiter', avatar: 'DK', status: 'online' },
      { id: 'h2', name: 'Maria Lopez', role: 'HR Specialist', avatar: 'ML', status: 'away' }
    ],
    totalMembers: 3,
    activeProjects: 1
  },
  {
    id: 'uiux',
    name: 'UI/UX',
    description: 'User interface and experience design',
    icon: <Palette className="h-5 w-5" />,
    color: 'bg-indigo-500',
    projectManager: {
      id: 'pm6',
      name: 'Oliver Thompson',
      role: 'Design Lead',
      avatar: 'OT',
      status: 'online',
      isProjectManager: true
    },
    members: [
      { id: 'u1', name: 'Zoe Anderson', role: 'UI Designer', avatar: 'ZA', status: 'online' },
      { id: 'u2', name: 'Lucas Brown', role: 'UX Researcher', avatar: 'LB', status: 'away' },
      { id: 'u3', name: 'Isabella Davis', role: 'Product Designer', avatar: 'ID', status: 'online' }
    ],
    totalMembers: 4,
    activeProjects: 3
  },
  {
    id: 'aiml',
    name: 'AI/ML',
    description: 'Artificial intelligence and machine learning',
    icon: <Brain className="h-5 w-5" />,
    color: 'bg-teal-500',
    projectManager: {
      id: 'pm7',
      name: 'Dr. Alan Turing',
      role: 'AI Research Lead',
      avatar: 'AT',
      status: 'online',
      isProjectManager: true
    },
    members: [
      { id: 'a1', name: 'Dr. Elena Volkov', role: 'ML Engineer', avatar: 'EV', status: 'online' },
      { id: 'a2', name: 'Dr. Marcus Chen', role: 'Data Scientist', avatar: 'MC', status: 'away' },
      { id: 'a3', name: 'Dr. Priya Sharma', role: 'AI Researcher', avatar: 'PS', status: 'online' }
    ],
    totalMembers: 4,
    activeProjects: 2
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    description: 'iOS and Android application development',
    icon: <Smartphone className="h-5 w-5" />,
    color: 'bg-cyan-500',
    projectManager: {
      id: 'pm8',
      name: 'Carlos Mendez',
      role: 'Mobile Lead',
      avatar: 'CM',
      status: 'online',
      isProjectManager: true
    },
    members: [
      { id: 'mo1', name: 'Anna Petrov', role: 'iOS Developer', avatar: 'AP', status: 'online' },
      { id: 'mo2', name: 'Ben Johnson', role: 'Android Developer', avatar: 'BJ', status: 'away' },
      { id: 'mo3', name: 'Grace Liu', role: 'React Native Developer', avatar: 'GL', status: 'online' }
    ],
    totalMembers: 4,
    activeProjects: 3
  }
]

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400'
}

export function TeamsList({ className }: TeamsListProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    projectManager: '',
    color: 'bg-blue-500'
  })

  const getStatusColor = (status: 'online' | 'away' | 'offline') => {
    return statusColors[status]
  }

  return (
    <div className={`${className} px-4 sm:px-6`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Teams</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage your teams and project managers</p>
        </div>
        <Button 
          className="bg-primary-purple hover:bg-primary-purple/90 w-full sm:w-auto"
          onClick={() => setShowCreateForm(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-full mx-auto">
        {teamsData.map((team) => (
          <Card 
            key={team.id} 
            className="hover:shadow-lg hover:bg-primary-purple/5 hover:border-primary-purple/20 transition-all duration-200 cursor-pointer min-h-[350px] flex flex-col"
            onClick={() => setSelectedTeam(team.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${team.color} text-white`}>
                    {team.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription className="text-sm">{team.description}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary-purple hover:text-white transition-all duration-200">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 flex-1">
              {/* Project Manager */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-white">Project Manager</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-primary-purple text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {team.projectManager.avatar}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(team.projectManager.status)}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{team.projectManager.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{team.projectManager.role}</p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-white">Team Members</span>
                  <Badge variant="secondary" className="text-xs">
                    {team.totalMembers} members
                  </Badge>
                </div>
                <div className="space-y-2">
                  {team.members.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${getStatusColor(member.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  {team.members.length > 3 && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center text-xs">
                        +{team.members.length - 3}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">more members</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{team.totalMembers}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{team.activeProjects}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Projects</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary-purple hover:text-white hover:bg-primary-purple transition-all duration-200">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {teamsData.find(t => t.id === selectedTeam)?.name} Team
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedTeam(null)}
                >
                  ×
                </Button>
              </div>
              
              {/* Team Details */}
              <div className="space-y-6">
                {/* Project Manager */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Project Manager</h4>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary-purple text-white rounded-full flex items-center justify-center text-lg font-medium">
                        {teamsData.find(t => t.id === selectedTeam)?.projectManager.avatar}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(teamsData.find(t => t.id === selectedTeam)?.projectManager.status || 'offline')}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {teamsData.find(t => t.id === selectedTeam)?.projectManager.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {teamsData.find(t => t.id === selectedTeam)?.projectManager.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* All Team Members */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">All Team Members</h4>
                  <div className="space-y-3">
                    {teamsData.find(t => t.id === selectedTeam)?.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-full flex items-center justify-center font-medium">
                            {member.avatar}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {member.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Team</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </Button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    placeholder="Enter team name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                    placeholder="Enter team description"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Project Manager
                  </label>
                  <input
                    type="text"
                    value={newTeam.projectManager}
                    onChange={(e) => setNewTeam({...newTeam, projectManager: e.target.value})}
                    placeholder="Enter project manager name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Team Color
                  </label>
                  <select
                    value={newTeam.color}
                    onChange={(e) => setNewTeam({...newTeam, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple dark:bg-gray-700 dark:text-white"
                  >
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-pink-500">Pink</option>
                    <option value="bg-orange-500">Orange</option>
                    <option value="bg-indigo-500">Indigo</option>
                    <option value="bg-teal-500">Teal</option>
                    <option value="bg-cyan-500">Cyan</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    className="bg-primary-purple hover:bg-primary-purple/90 flex-1"
                    onClick={() => {
                      // Here you would add the new team to your teams data
                      console.log('Creating team:', newTeam)
                      setShowCreateForm(false)
                      setNewTeam({ name: '', description: '', projectManager: '', color: 'bg-blue-500' })
                    }}
                  >
                    Create Team
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateForm(false)}
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
