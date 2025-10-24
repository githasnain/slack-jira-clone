'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SessionInfo() {
  const { data: session, status } = useSession();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!session?.expires) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(session.expires);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Session expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s remaining`);
      } else {
        setTimeRemaining(`${seconds}s remaining`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [session?.expires]);

  if (status === 'loading' || !session) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        title="Session Information"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Session</span>
      </button>

      {showInfo && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Session Information</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>User:</strong> {session.user?.name || session.user?.email}</p>
              <p><strong>Role:</strong> {session.user?.role}</p>
              <p><strong>Status:</strong> {timeRemaining}</p>
              <p><strong>Expires:</strong> {session.expires ? new Date(session.expires).toLocaleString() : 'Unknown'}</p>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Session expires after 8 hours of inactivity
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
