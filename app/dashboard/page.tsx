'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import MainLayout from '../../components/MainLayout';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'ON_HOLD';
  _count: {
    tasks: number;
  };
}

interface Activity {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  assignee?: {
    name: string;
  };
  project?: {
    name: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (session.user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
      return;
    }
    
    setIsLoading(false);
    loadDashboardData();
  }, [session, status, router]);

  const loadDashboardData = async () => {
    try {
      const [tasksRes, projectsRes, activitiesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects'),
        fetch('/api/analytics')
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } else {
        console.error('Failed to load tasks:', tasksRes.status);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } else {
        console.error('Failed to load projects:', projectsRes.status);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        // The analytics API returns an object with recentActivity property
        const recentActivity = activitiesData.recentActivity || activitiesData;
        setActivities(Array.isArray(recentActivity) ? recentActivity : []);
      } else {
        console.error('Failed to load activities:', activitiesRes.status);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty arrays as fallback
      setTasks([]);
      setProjects([]);
      setActivities([]);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {session.user?.name || session.user?.email}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This is your user dashboard. You have limited access to projects and tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              My Tasks
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">To Do</span>
                <span className="font-medium">{tasks.filter(task => task.status === 'TODO').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                <span className="font-medium">{tasks.filter(task => task.status === 'IN_PROGRESS').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">In Review</span>
                <span className="font-medium">{tasks.filter(task => task.status === 'IN_REVIEW').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-medium">{tasks.filter(task => task.status === 'DONE').length}</span>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              My Projects
            </h3>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No projects assigned</p>
              ) : (
                projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="border-l-4 border-green-500 pl-3">
                    <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.status}</p>
                    <p className="text-xs text-gray-500">{project._count.tasks} tasks</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <a href="/tickets" className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
                View My Tasks
              </a>
              <a href="/projects" className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
                View Projects
              </a>
              <a href="/teams" className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
                View Teams
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {!activities || activities.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
                ) : (
                  activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Task "{activity.title}" - {activity.status}
                        {activity.project && ` in ${activity.project.name}`}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}