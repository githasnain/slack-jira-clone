'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Clock, 
  User, 
  Tag, 
  Calendar,
  Filter,
  Search,
  Plus,
  ChevronDown
} from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
}

interface ChannelData {
  tickets: Ticket[];
  channel: {
    id: string;
    name: string;
    slug: string;
    isMain: boolean;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'in_progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

export default function ChannelPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [data, setData] = useState<ChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });

  useEffect(() => {
    const fetchChannelTickets = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.set('status', filters.status);
        if (filters.priority) queryParams.set('priority', filters.priority);
        
        const response = await fetch(`/api/channels/${slug}/tickets?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch channel tickets');
        }
        const channelData = await response.json();
        setData(channelData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets');
        console.error('Channel error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelTickets();
  }, [slug, filters.status, filters.priority]);

  const filteredTickets = data?.tickets.filter(ticket => {
    if (!filters.search) return true;
    return ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
           ticket.description?.toLowerCase().includes(filters.search.toLowerCase());
  }) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slack-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Channel
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                #{data.channel.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {data.pagination.total} tickets in this channel
              </p>
            </div>
            <button className="bg-slack-600 text-white px-4 py-2 rounded-md hover:bg-slack-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Ticket</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white appearance-none"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white appearance-none"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <button
              onClick={() => setFilters({ status: '', priority: '', search: '' })}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Tag className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tickets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filters.search || filters.status || filters.priority
                  ? 'Try adjusting your filters'
                  : 'Create the first ticket for this channel'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {ticket.title}
                      </h3>
                      
                      {ticket.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {ticket.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{ticket.creator.name || ticket.creator.email}</span>
                        </div>
                        
                        {ticket.assignee && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>→ {ticket.assignee.name || ticket.assignee.email}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                      </div>
                      
                      {ticket.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ticket.tags.map((ticketTag) => (
                            <span
                              key={ticketTag.tag.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {ticketTag.tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



