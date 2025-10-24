'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MainLayout from '../../../components/MainLayout';

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: string;
  createdAt: string;
  _count: {
    members: number;
    messages: number;
  };
  members: {
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminChannelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('MEMBER');
  const [isAdding, setIsAdding] = useState(false);

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
      loadData();
    };

    checkAuth();
  }, [session, status, router]);

  // Debug selectedChannel changes
  useEffect(() => {
    console.log('🔍 selectedChannel changed:', selectedChannel);
    if (selectedChannel) {
      console.log('🔍 selectedChannel.id:', selectedChannel.id);
    }
  }, [selectedChannel]);

  // Ensure channel is always selected when channels are available
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      console.log('🔍 No channel selected, auto-selecting first channel from useEffect');
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

  const loadData = async () => {
    try {
      console.log('🔍 Loading data...');
      const [channelsRes, usersRes] = await Promise.all([
        fetch('/api/admin/channels'),
        fetch('/api/users')
      ]);

      console.log('🔍 Channels response status:', channelsRes.status);
      console.log('🔍 Users response status:', usersRes.status);

      if (channelsRes.ok) {
        const channelsData = await channelsRes.json();
        console.log('🔍 Channels data:', channelsData);
        setChannels(channelsData);
        
        // Auto-select first channel if none selected
        if (channelsData.length > 0) {
          if (!selectedChannel) {
            console.log('🔍 Auto-selecting first channel:', channelsData[0]);
            setSelectedChannel(channelsData[0]);
          } else {
            // Update the selected channel with fresh data
            const updatedChannel = channelsData.find((c: Channel) => c.id === selectedChannel.id);
            if (updatedChannel) {
              console.log('🔍 Updating selected channel with fresh data:', updatedChannel);
              setSelectedChannel(updatedChannel);
            } else {
              // If current selection not found, select first channel
              console.log('🔍 Current selection not found, selecting first channel:', channelsData[0]);
              setSelectedChannel(channelsData[0]);
            }
          }
        }
      } else {
        console.error('❌ Channels API error:', channelsRes.status, channelsRes.statusText);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('🔍 Users data:', usersData);
        setUsers(usersData);
      } else {
        console.error('❌ Users API error:', usersRes.status, usersRes.statusText);
      }
      
      console.log('✅ Data loading completed');
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
  };

  const handleAddUserToChannel = async () => {
    console.log('🔍 handleAddUserToChannel called');
    console.log('🔍 selectedChannel:', selectedChannel);
    console.log('🔍 selectedChannel type:', typeof selectedChannel);
    console.log('🔍 selectedChannel keys:', selectedChannel ? Object.keys(selectedChannel) : 'null');
    console.log('🔍 selectedChannel.id:', selectedChannel?.id);
    console.log('🔍 selectedUser:', selectedUser);
    
    // If no channel selected, try to select the first one
    if (!selectedChannel && channels.length > 0) {
      console.log('🔍 No channel selected, auto-selecting first channel');
      setSelectedChannel(channels[0]);
      alert('Please try again - channel has been auto-selected');
      return;
    }
    
    if (!selectedChannel) {
      console.log('❌ No channel selected and no channels available');
      alert('No channels available');
      return;
    }
    
    if (!selectedChannel.id) {
      console.log('❌ Selected channel has no ID:', selectedChannel);
      console.log('❌ Available properties:', Object.keys(selectedChannel));
      alert('Selected channel is invalid - missing ID');
      return;
    }
    
    if (!selectedUser) {
      console.log('❌ No user selected');
      alert('Please select a user');
      return;
    }

    setIsAdding(true);
    try {
      console.log('🔍 Adding user to channel:', {
        channelId: selectedChannel.id,
        userId: selectedUser,
        role: selectedRole,
        selectedChannel: selectedChannel
      });

      const response = await fetch(`/api/admin/channels/${selectedChannel.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          role: selectedRole
        })
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Success:', result);
        alert('User added to channel successfully!');
        
        // Reload data and wait for it to complete
        await loadData();
        setSelectedUser('');
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Parsed error:', errorJson);
          alert(`Error: ${errorJson.error || 'Unknown error'}`);
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
          alert(`Error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUserFromChannel = async (channelId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the channel?')) {
      return;
    }

    console.log('🔍 Removing user from channel:', { channelId, userId });

    try {
      const response = await fetch(`/api/admin/channels/${channelId}/members?userId=${userId}`, {
        method: 'DELETE'
      });

      console.log('🔍 Remove response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Remove success:', result);
        alert('User removed from channel successfully!');
        
        // Reload data and wait for it to complete
        await loadData();
      } else {
        const errorText = await response.text();
        console.error('❌ Remove error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Remove parsed error:', errorJson);
          alert(`Error: ${errorJson.error || 'Unknown error'}`);
        } catch (parseError) {
          console.error('❌ Could not parse remove error response:', parseError);
          alert(`Error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ Network error removing user:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Channel Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage channel memberships and user access
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Channels List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Channels
            </h2>
            <div className="space-y-4">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedChannel?.id === channel.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => {
                    console.log('🔍 Channel clicked:', channel);
                    console.log('🔍 Channel ID:', channel.id);
                    setSelectedChannel(channel);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {channel.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {channel._count.members} members • {channel._count.messages} messages
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                      {channel.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {selectedChannel ? `Manage ${selectedChannel.name}` : 'Select a Channel'}
            </h2>

            {selectedChannel ? (
              <div className="space-y-6">
                {/* Add User to Channel */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Add User to Channel
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select User
                      </label>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Choose a user...</option>
                        {users
                          .filter(user => !selectedChannel.members.some(member => member.user.id === user.id))
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddUserToChannel}
                      disabled={!selectedUser || isAdding}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdding ? 'Adding...' : 'Add User to Channel'}
                    </button>
                  </div>
                </div>

                {/* Current Members */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Current Members ({selectedChannel.members.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedChannel.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {member.user.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {member.user.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {member.role}
                          </span>
                          <button
                            onClick={() => handleRemoveUserFromChannel(selectedChannel.id, member.user.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Select a channel from the list to manage its members.
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
