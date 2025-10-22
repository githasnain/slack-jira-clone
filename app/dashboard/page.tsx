'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import MainLayout from '../../components/MainLayout';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
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
    };

    checkAuth();
  }, [session, status, router]);

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
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-medium">5</span>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              My Projects
            </h3>
            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-3">
                <p className="font-medium text-gray-900 dark:text-white">Web Application</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="font-medium text-gray-900 dark:text-white">Mobile App</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Planning</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
                View My Tasks
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
                Join Project
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
                Update Profile
              </button>
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
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completed task: "Design landing page"
                  </p>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Assigned to project: "Web Application"
                  </p>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Task updated: "API documentation" - In Review
                  </p>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}