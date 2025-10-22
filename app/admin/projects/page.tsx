'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  dueDate: string | null;
  createdAt: string;
  _count: {
    tasks: number;
    members: number;
    teams: number;
  };
  teams: Team[];
}

interface Team {
  id: string;
  name: string;
  type: string;
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: string;
  createdAt: string;
  _count: {
    members: number;
    messages: number;
  };
}

export default function AdminProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'channels'>('projects');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PUBLIC',
    dueDate: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      if (session.user?.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      
      setIsLoading(false);
      loadData();
    };

    checkAuth();
  }, [session, status, router]);

  const loadData = async () => {
    try {
      const [projectsRes, channelsRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/channels')
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }

      if (channelsRes.ok) {
        const channelsData = await channelsRes.json();
        setChannels(channelsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = activeTab === 'projects' ? '/api/admin/projects' : '/api/admin/channels';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ name: '', description: '', type: 'PUBLIC', dueDate: '' });
        loadData();
      }
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  if (isLoading || status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Project & Channel Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create and manage projects, channels, and teams
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-slack-600 hover:bg-slack-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create {activeTab === 'projects' ? 'Project' : 'Channel'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-slack-500 text-slack-600 dark:text-slack-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Projects ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('channels')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'channels'
                    ? 'border-slack-500 text-slack-600 dark:text-slack-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Channels ({channels.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new project.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {project.description}
                      </p>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-slack-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {project._count.tasks}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Tasks</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {project._count.members}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Members</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {project._count.teams}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Teams</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Teams: {project.teams.map(team => team.name).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            {channels.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No channels</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new channel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {channels.map((channel) => (
                  <div key={channel.id} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        #{channel.name}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        channel.type === 'PUBLIC' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {channel.type}
                      </span>
                    </div>
                    
                    {channel.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {channel.description}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {channel._count.members}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Members</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {channel._count.messages}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Messages</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created {new Date(channel.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-dark-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Create {activeTab === 'projects' ? 'Project' : 'Channel'}
                </h3>
                
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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

                  {activeTab === 'channels' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                      </select>
                    </div>
                  )}

                  {activeTab === 'projects' && (
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
                  )}

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
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
