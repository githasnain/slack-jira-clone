'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import UserStatus from './UserStatus';
import { getStatusColor, getPriorityColor } from '@/lib/utils';

interface TicketCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigneeId: string | null;
    projectId: string | null;
    teamId: string | null;
    dueDate: string | null;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    assignee: {
      id: string;
      name: string;
      email: string;
    } | null;
    project: {
      id: string;
      name: string;
    } | null;
    team: {
      id: string;
      name: string;
      type: string;
    } | null;
    assignBy?: string | null;
    assignTo?: string | null;
    createdBy?: string;
  };
  onView: (task: any) => void;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onStatusUpdate: (taskId: string, status: string) => void;
}

export default function TicketCard({ 
  task, 
  onView, 
  onEdit, 
  onDelete, 
  onStatusUpdate 
}: TicketCardProps) {
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(false);

  const canEdit = session?.user?.role === 'ADMIN' || task.assigneeId === session?.user?.id;
  const canDelete = session?.user?.role === 'ADMIN' || task.assigneeId === session?.user?.id;

  return (
    <div 
      className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {task.title}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-1 ml-2">
          <button
            onClick={() => onView(task)}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="View Details"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          
          {canEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Edit Task"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete Task"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {task.description}
          </p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Project */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Project:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {task.project?.name || 'Not assigned'}
          </span>
        </div>

        {/* Team */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Team:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {task.team?.name || 'Not assigned'}
          </span>
        </div>

        {/* Created By */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Created By:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {task.createdBy || task.assignee?.name || 'Unknown'}
          </span>
        </div>

        {/* Assigned To */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Assigned To:</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 dark:text-white font-medium">
              {task.assignee?.name || 'Unassigned'}
            </span>
            {task.assignee && <UserStatus userId={task.assignee.id} showLabel={false} size="sm" />}
          </div>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Assigned By */}
        {task.assignBy && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Assigned By:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {task.assignBy}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Created {new Date(task.createdAt).toLocaleDateString()}
          </span>
          <div className="flex space-x-2">
            <select
              value={task.status}
              onChange={(e) => onStatusUpdate(task.id, e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              disabled={!canEdit}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
