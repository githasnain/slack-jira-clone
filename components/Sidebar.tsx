'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Hash, 
  Plus, 
  Settings, 
  Users, 
  Bell,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  slug: string;
  isMain: boolean;
  ticketCount?: number;
}

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/channels');
        if (response.ok) {
          const data = await response.json();
          setChannels(data.channels);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const isActiveChannel = (slug: string) => {
    return pathname === `/channels/${slug}`;
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.isMain) {
      return <Hash className="h-4 w-4" />;
    }
    return <Hash className="h-4 w-4" />;
  };

  const getChannelName = (channel: Channel) => {
    return channel.isMain ? channel.name : `# ${channel.name}`;
  };

  return (
    <div className={`w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Channels
          </h2>
          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-2">
            <div className="space-y-1">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.slug}`}
                  className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActiveChannel(channel.slug)
                      ? 'bg-slack-100 dark:bg-slack-900/20 text-slack-700 dark:text-slack-300 border-r-2 border-slack-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`flex-shrink-0 ${
                      isActiveChannel(channel.slug)
                        ? 'text-slack-600 dark:text-slack-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`}>
                      {getChannelIcon(channel)}
                    </div>
                    <span className="truncate">
                      {getChannelName(channel)}
                    </span>
                  </div>
                  {channel.ticketCount !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isActiveChannel(channel.slug)
                        ? 'bg-slack-200 dark:bg-slack-800 text-slack-700 dark:text-slack-300'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-500'
                    }`}>
                      {channel.ticketCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              pathname === '/dashboard'
                ? 'bg-slack-100 dark:bg-slack-900/20 text-slack-700 dark:text-slack-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          
          <Link
            href="/users"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              pathname === '/users'
                ? 'bg-slack-100 dark:bg-slack-900/20 text-slack-700 dark:text-slack-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </Link>
        </div>
      </div>
    </div>
  );
}



