'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import MainLayout from '../../components/MainLayout';

interface AnalyticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    reviewTasks: number;
    completionRate: number;
    avgCompletionTime: number;
  };
  tasksByPriority: {
    priority: string;
    count: number;
  }[];
  tasksByStatus: {
    status: string;
    count: number;
  }[];
  tasksByTeam: {
    teamId: string;
    teamName: string;
    teamType: string;
    count: number;
  }[];
  recentActivity: any[];
  projectStats: {
    id: string;
    name: string;
    totalTasks: number;
    completedTasks: number;
    members: number;
    teams: number;
    completionRate: number;
  }[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setIsLoading(false);
      loadAnalytics();
    };

    checkAuth();
  }, [session, status, router]);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedProject]);

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedProject && { projectId: selectedProject })
      });

      const response = await fetch(`/api/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'REVIEW':
        return 'bg-yellow-500';
      case 'DONE':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-500';
      case 'MEDIUM':
        return 'bg-blue-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'URGENT':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track project progress and team performance
              </p>
            </div>
            
            <div className="flex space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {analyticsData && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData.overview.totalTasks}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData.overview.completedTasks}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData.overview.inProgressTasks}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData.overview.completionRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {/* Tasks by Status */}
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Tasks by Status
                </h3>
                <div className="space-y-3">
                  {analyticsData.tasksByStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)} mr-3`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks by Priority */}
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Tasks by Priority
                </h3>
                <div className="space-y-3">
                  {analyticsData.tasksByPriority.map((item) => (
                    <div key={item.priority} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)} mr-3`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.priority}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks by Team */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Tasks by Team
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.tasksByTeam.map((item) => (
                  <div key={item.teamId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.teamName}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.teamType}
                      </span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {item.count}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      tasks assigned
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Statistics */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Project Statistics
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Tasks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Completion Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Teams
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {analyticsData.projectStats.map((project) => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {project.totalTasks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {project.completedTasks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${project.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {project.completionRate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {project.members}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {project.teams}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </span>
                        {' '}in{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {activity.project.name}
                        </span>
                        {' '}assigned to{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {activity.assignee?.name || 'Unassigned'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === 'DONE' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : activity.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : activity.status === 'REVIEW'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
