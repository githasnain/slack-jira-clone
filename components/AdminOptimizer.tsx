'use client';

import { memo, useCallback, useMemo, useState, useEffect } from 'react';

// Memoized components for better performance
export const MemoizedStatsCard = memo(({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-2 ${color} rounded-lg`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
));

MemoizedStatsCard.displayName = 'MemoizedStatsCard';

export const MemoizedProjectCard = memo(({ project, onEdit, onDelete }: {
  project: any;
  onEdit: (project: any) => void;
  onDelete: (project: any) => void;
}) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          project.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {project.status}
        </span>
        <button 
          onClick={() => onEdit(project)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(project)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          Delete
        </button>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{project.description}</p>
    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
      <span>{project.teams?.length || 0} teams</span>
      <span>{project.members?.length || 0} members</span>
      <span>{project.tasks?.length || 0} tickets</span>
    </div>
  </div>
));

MemoizedProjectCard.displayName = 'MemoizedProjectCard';

export const MemoizedTicketCard = memo(({ ticket, onEdit, onDelete }: {
  ticket: any;
  onEdit: (ticket: any) => void;
  onDelete: (ticket: any) => void;
}) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h4>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          ticket.status === 'DONE' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : ticket.status === 'IN_PROGRESS'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {ticket.status}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          ticket.priority === 'HIGH' || ticket.priority === 'URGENT'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {ticket.priority}
        </span>
        <button 
          onClick={() => onEdit(ticket)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(ticket)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          Delete
        </button>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.description}</p>
    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
      <span>Assignee: {ticket.assignee?.name || 'Unassigned'}</span>
      <span>Project: {ticket.project?.name || 'No Project'}</span>
      <span>Team: {ticket.team?.name || 'No Team'}</span>
    </div>
  </div>
));

MemoizedTicketCard.displayName = 'MemoizedTicketCard';

// Custom hooks for performance optimization
export const useAdminData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin?type=overview');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        throw new Error('Failed to load admin data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
};

// Memoized selectors for computed values
export const useAdminStats = (data: any) => {
  return useMemo(() => {
    if (!data) return null;
    
    return {
      totalProjects: data.stats?.totalProjects || 0,
      totalTeams: data.stats?.totalTeams || 0,
      totalTickets: data.stats?.totalTickets || 0,
      activeProjects: data.stats?.activeProjects || 0,
      completedTickets: data.stats?.completedTickets || 0
    };
  }, [data]);
};

export const useFilteredProjects = (projects: any[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm) return projects;
    
    return projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);
};

export const useFilteredTickets = (tickets: any[], filters: any) => {
  return useMemo(() => {
    return tickets.filter(ticket => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.projectId && ticket.projectId !== filters.projectId) return false;
      if (filters.teamId && ticket.teamId !== filters.teamId) return false;
      return true;
    });
  }, [tickets, filters]);
};

// Debounced search hook
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = (items: any[], itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight), items.length);
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};
