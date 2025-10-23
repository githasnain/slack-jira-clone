'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminUserSwitcherProps {
  onUserSwitch: (userId: string) => void;
}

export default function AdminUserSwitcher({ onUserSwitch }: AdminUserSwitcherProps) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadUsers();
    }
  }, [session]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSwitch = (userId: string) => {
    onUserSwitch(userId);
    setShowSwitcher(false);
  };

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowSwitcher(!showSwitcher)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        disabled={loading}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span>Switch User</span>
      </button>

      {showSwitcher && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            Switch to User View
          </div>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSwitch(user.id)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</div>
              </div>
              <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {user.role}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

