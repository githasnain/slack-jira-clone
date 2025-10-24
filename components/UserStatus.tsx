'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserStatusProps {
  userId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserStatus({ userId, showLabel = true, size = 'md' }: UserStatusProps) {
  const { data: session } = useSession();
  const [userStatus, setUserStatus] = useState<'ONLINE' | 'AWAY' | 'OFFLINE'>('OFFLINE');
  const [lastActive, setLastActive] = useState<string>('');

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/status`);
        if (response.ok) {
          const data = await response.json();
          setUserStatus(data.status);
          setLastActive(data.lastActive);
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    if (userId) {
      fetchUserStatus();
      // Update status every 30 seconds
      const interval = setInterval(fetchUserStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-green-500';
      case 'AWAY':
        return 'bg-yellow-500';
      case 'OFFLINE':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'Online';
      case 'AWAY':
        return 'Away';
      case 'OFFLINE':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${getSizeClasses()} rounded-full ${getStatusColor(userStatus)}`}></div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {getStatusText(userStatus)}
          </span>
          {lastActive && userStatus === 'OFFLINE' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last active: {new Date(lastActive).toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
