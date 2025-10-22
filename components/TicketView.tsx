'use client';

import { useState } from 'react';
import { 
  Calendar, 
  User, 
  Tag, 
  AlertCircle, 
  Clock, 
  Edit3,
  MessageSquare,
  Hash,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';

interface TicketViewProps {
  ticket: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    dueDate: string | null;
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
    channel: {
      id: string;
      name: string;
      slug: string;
    };
    tags: Array<{
      tag: {
        id: string;
        name: string;
      };
    }>;
  };
  onEdit?: () => void;
  className?: string;
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

const STATUS_ICONS = {
  draft: <Edit3 className="h-4 w-4" />,
  open: <Play className="h-4 w-4" />,
  'in_progress': <Clock className="h-4 w-4" />,
  resolved: <CheckCircle className="h-4 w-4" />,
  closed: <XCircle className="h-4 w-4" />
};

export default function TicketView({ ticket, onEdit, className = '' }: TicketViewProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const getDescriptionText = () => {
    if (!ticket.description) return '';
    const text = stripHtml(ticket.description);
    return showFullDescription ? text : text.substring(0, 200) + (text.length > 200 ? '...' : '');
  };

  const isOverdue = () => {
    if (!ticket.dueDate) return false;
    return new Date(ticket.dueDate) < new Date();
  };

  return (
    <div className={`bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <Hash className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {ticket.channel.name}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {ticket.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft
              }`}>
                {STATUS_ICONS[ticket.status as keyof typeof STATUS_ICONS]}
                <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
              </span>
              
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium
              }`}>
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="capitalize">{ticket.priority}</span>
              </span>
              
              {ticket.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {ticket.category}
                </span>
              )}
            </div>
          </div>
          
          {onEdit && (
            <button
              onClick={onEdit}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Edit ticket"
            >
              <Edit3 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        {ticket.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <div 
                className="text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ 
                  __html: showFullDescription 
                    ? ticket.description 
                    : ticket.description.substring(0, 200) + (ticket.description.length > 200 ? '...' : '')
                }}
              />
              {ticket.description.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 text-sm text-slack-600 hover:text-slack-700 dark:text-slack-400 dark:hover:text-slack-300"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {ticket.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((ticketTag) => (
                <span
                  key={ticketTag.tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slack-100 text-slack-800 dark:bg-slack-900/20 dark:text-slack-300"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {ticketTag.tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creator */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Created by
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ticket.creator.name || ticket.creator.email}
              </p>
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Assigned to
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ticket.assignee ? (ticket.assignee.name || ticket.assignee.email) : 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Created
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatRelativeDate(ticket.createdAt)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {formatDate(ticket.createdAt)}
              </p>
            </div>
          </div>

          {/* Due Date */}
          {ticket.dueDate && (
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                isOverdue() 
                  ? 'bg-red-100 dark:bg-red-900/20' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Clock className={`h-4 w-4 ${
                  isOverdue() 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Due Date
                </p>
                <p className={`text-sm ${
                  isOverdue() 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {formatRelativeDate(ticket.dueDate)}
                  {isOverdue() && ' (Overdue)'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatDate(ticket.dueDate)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated {formatRelativeDate(ticket.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}



