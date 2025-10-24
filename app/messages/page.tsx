'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import MainLayout from '../../components/MainLayout';

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  reactions: {
    id: string;
    emoji: string;
    user: {
      id: string;
      name: string;
    };
  }[];
  replies: Message[];
  attachments: any[];
}

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: string;
  _count: {
    members: number;
    messages: number;
  };
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setIsLoading(false);
      loadChannels();
    };

    checkAuth();
  }, [session, status, router]);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages();
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      if (response.ok) {
        const channelsData = await response.json();
        setChannels(channelsData);
        if (channelsData.length > 0) {
          setSelectedChannel(channelsData[0]);
        }
      } else {
        console.error('Failed to load channels:', response.status);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedChannel) return;

    try {
      const response = await fetch(`/api/messages?channelId=${selectedChannel.id}`);
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChannel || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          channelId: selectedChannel.id,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages(); // Reload messages to get the new one
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch('/api/messages/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          emoji,
        }),
      });

      if (response.ok) {
        loadMessages(); // Reload messages to get updated reactions
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getReactionCount = (message: Message, emoji: string) => {
    return message.reactions.filter(reaction => reaction.emoji === emoji).length;
  };

  const hasUserReacted = (message: Message, emoji: string) => {
    return message.reactions.some(reaction => 
      reaction.emoji === emoji && reaction.user.id === session?.user?.id
    );
  };

  if (isLoading || status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="h-screen flex bg-gray-50 dark:bg-dark-900">
        {/* Channels Sidebar */}
        <div className="w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-gray-700 flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Channels
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                    selectedChannel?.id === channel.id
                      ? 'bg-slack-100 dark:bg-slack-900 text-slack-900 dark:text-slack-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">#{channel.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {channel._count.messages}
                    </span>
                  </div>
                  {channel.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {channel.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Channel Selector */}
          <div className="lg:hidden bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <select
              value={selectedChannel?.id || ''}
              onChange={(e) => {
                const channel = channels.find(c => c.id === e.target.value);
                setSelectedChannel(channel || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a channel</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  #{channel.name}
                </option>
              ))}
            </select>
          </div>

          {selectedChannel ? (
            <>
              {/* Channel Header */}
              <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                      #{selectedChannel.name}
                    </h1>
                    {selectedChannel.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedChannel.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{selectedChannel._count.members} members</span>
                    <span>{selectedChannel._count.messages} messages</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {message.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {message.user.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      
                      <div className="text-gray-800 dark:text-gray-200 mb-2">
                        {message.content}
                      </div>

                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction(message.id, emoji)}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs transition-colors ${
                                hasUserReacted(message, emoji)
                                  ? 'bg-slack-100 dark:bg-slack-900 text-slack-900 dark:text-slack-100'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              <span className="mr-1">{emoji}</span>
                              <span>{getReactionCount(message, emoji)}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Quick Reactions */}
                      <div className="flex space-x-2">
                        {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(message.id, emoji)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <form onSubmit={sendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${selectedChannel.name}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-slack-500 focus:border-slack-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-4 py-2 bg-slack-600 hover:bg-slack-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No channel selected</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select a channel to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
