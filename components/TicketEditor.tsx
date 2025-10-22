'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAutosave } from '@/lib/useAutosave';
import { Calendar, User, Tag, AlertCircle, Clock } from 'lucide-react';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface TicketEditorProps {
  initialData?: {
    title: string;
    description?: string;
    priority?: string;
    category?: string;
    channelId?: string;
    assigneeId?: string;
    dueDate?: string;
    tags?: string;
  };
  channels?: Array<{ id: string; name: string; slug: string }>;
  users?: Array<{ id: string; name: string; email: string }>;
  onSave?: (data: any) => Promise<void>;
  onPublish?: (data: any) => Promise<void>;
}

export default function TicketEditor({
  initialData = {
    title: '',
    description: '',
    priority: 'medium',
    category: 'task',
    tags: '',
  },
  channels = [],
  users = [],
  onSave,
  onPublish
}: TicketEditorProps) {
  const [formData, setFormData] = useState(initialData);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isQuillReady, setIsQuillReady] = useState(false);

  const { isSaving, lastSavedAt, error } = useAutosave({
    data: formData,
    delay: 2000,
    onSave
  });

  // Quill configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'link', 'code-block'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuillChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  useEffect(() => {
    // Set Quill as ready after component mounts
    setIsQuillReady(true);
  }, []);

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsPublishing(true);
    try {
      if (onPublish) {
        await onPublish({ ...formData, status: 'open' });
      } else {
        // Default publish logic
        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            status: 'open'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to publish ticket');
        }
      }
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish ticket');
    } finally {
      setIsPublishing(false);
    }
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg">
      {/* Header with save status */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Ticket
        </h2>
        <div className="flex items-center space-x-4">
          {isSaving && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slack-500 mr-2"></div>
              Saving...
            </div>
          )}
          {lastSavedAt && !isSaving && (
            <div className="text-sm text-green-600">
              Saved {formatLastSaved(lastSavedAt)}
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600">
              Save failed
            </div>
          )}
        </div>
      </div>

      <form className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white"
            placeholder="Enter ticket title..."
            required
          />
        </div>

        {/* Description - Rich Text Editor */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            {isQuillReady && (
              <ReactQuill
                theme="snow"
                value={formData.description || ''}
                onChange={handleQuillChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Describe the ticket details..."
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'inherit'
                }}
              />
            )}
          </div>
        </div>

        {/* Row with Priority and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white"
              placeholder="e.g., bug, feature, task"
            />
          </div>
        </div>

        {/* Row with Channel and Assignee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="channel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Channel
            </label>
            <select
              id="channel"
              value={formData.channelId || ''}
              onChange={(e) => handleInputChange('channelId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white"
            >
              <option value="">Select a channel</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Assignee
            </label>
            <select
              id="assignee"
              value={formData.assigneeId || ''}
              onChange={(e) => handleInputChange('assigneeId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags Input */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="inline h-4 w-4 mr-1" />
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white"
            placeholder="Enter tags separated by commas (e.g., frontend, bug, urgent)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Due Date
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            value={formData.dueDate || ''}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slack-500 focus:border-slack-500 dark:bg-dark-700 dark:text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handlePublish}
            disabled={!formData.title.trim() || isPublishing}
            className="px-6 py-2 bg-slack-600 text-white rounded-md hover:bg-slack-700 focus:outline-none focus:ring-2 focus:ring-slack-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : 'Publish Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
