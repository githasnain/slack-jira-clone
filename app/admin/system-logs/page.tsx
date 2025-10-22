'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface SystemLog {
  id: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminSystemLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<SystemLog[]>([]);

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
      // Load system logs
      loadLogs();
    };

    checkAuth();
  }, [session, status, router]);

  const loadLogs = async () => {
    // Mock data for now - in a real app, this would fetch from API
    const mockLogs: SystemLog[] = [
      {
        id: '1',
        action: 'LOGIN_SUCCESS',
        details: 'User admin@workspace.com logged in successfully',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date().toISOString(),
        user: {
          name: 'Admin User',
          email: 'admin@workspace.com'
        }
      },
      {
        id: '2',
        action: 'USER_CREATED',
        details: 'New user user5@workspace.com created during system initialization',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        user: {
          name: 'Admin User',
          email: 'admin@workspace.com'
        }
      },
      {
        id: '3',
        action: 'PROJECT_CREATED',
        details: 'Web Application project created',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        user: {
          name: 'Admin User',
          email: 'admin@workspace.com'
        }
      },
      {
        id: '4',
        action: 'CHANNEL_CREATED',
        details: 'General channel created',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        user: {
          name: 'Admin User',
          email: 'admin@workspace.com'
        }
      },
      {
        id: '5',
        action: 'TICKET_CREATED',
        details: 'Authentication ticket created',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        user: {
          name: 'Admin User',
          email: 'admin@workspace.com'
        }
      }
    ];
    setLogs(mockLogs);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'USER_CREATED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PROJECT_CREATED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'CHANNEL_CREATED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'TICKET_CREATED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
                System Logs
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monitor system activity and user actions
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Export Logs
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Clear Logs
              </button>
            </div>
          </div>
        </div>

        {/* Log Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{logs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Actions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {logs.filter(l => l.action.includes('USER')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Actions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {logs.filter(l => l.action.includes('PROJECT')).length}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Logs</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Logs Table */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Activity Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {log.details}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.user ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {log.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
