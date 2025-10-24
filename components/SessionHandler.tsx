'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function SessionHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setSessionExpired(true);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    }
  }, [status, router]);

  useEffect(() => {
    // Check session validity every 5 minutes
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
          setSessionExpired(true);
          await signOut({ callbackUrl: '/login' });
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setSessionExpired(true);
        await signOut({ callbackUrl: '/login' });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (sessionExpired) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">
            Session Expired
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
            Your session has expired. You will be redirected to the login page.
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


