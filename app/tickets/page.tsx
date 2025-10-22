'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import MainLayout from '../../components/MainLayout';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
    type: string;
  } | null;
}

interface Project {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  type: string;
}

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState({
    projectId: '',
    teamId: '',
    status: '',
    priority: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    projectId: '',
    teamId: '',
    assigneeId: '',
    dueDate: '',
    tags: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setIsLoading(false);
      loadData();
    };

    checkAuth();
  }, [session, status, router]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects')
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        
        // Extract teams from projects
        const allTeams: Team[] = [];
        projectsData.forEach((project: any) => {
          project.teams.forEach((team: any) => {
            allTeams.push({
              id: team.id,
              name: team.name,
              type: team.type
            });
          });
        });
        setTeams(allTeams);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filters.projectId) {
      filtered = filtered.filter(task => task.project.id === filters.projectId);
    }

    if (filters.teamId) {
      filtered = filtered.filter(task => task.team?.id === filters.teamId);
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          projectId: '',
          teamId: '',
          assigneeId: '',
          dueDate: '',
          tags: ''
        });
        loadData();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'DONE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading || status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tickets & Tasks
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage and track your tasks across projects and teams
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-slack-600 hover:bg-slack-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create Task
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                value={filters.projectId}
                onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                value={filters.teamId}
                onChange={(e) => setFilters(prev => ({ ...prev, teamId: e.target.value }))}
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-2">
                  {task.title}
                </h3>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {task.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Project:</span>
                  <span className="text-gray-900 dark:text-white">{task.project.name}</span>
                </div>
                {task.team && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Team:</span>
                    <span className="text-gray-900 dark:text-white">{task.team.name}</span>
                  </div>
                )}
                {task.assignee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Assignee:</span>
                    <span className="text-gray-900 dark:text-white">{task.assignee.name}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Due:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {task.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new task.</p>
          </div>
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-dark-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Create New Task
                </h3>
                
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      value={formData.projectId}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      value={formData.teamId}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
                    >
                      <option value="">Select Team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="frontend, bug, urgent"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-slack-600 hover:bg-slack-700 rounded-md"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
