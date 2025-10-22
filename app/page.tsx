'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slack-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slack-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Slack Jira Clone
          </h1>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                User Information
              </h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {session.user?.name}</p>
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Role:</strong> {session.user?.role}</p>
                <p><strong>User ID:</strong> {session.user?.id}</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-slack-600 hover:bg-slack-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}