export interface Ticket {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string | null;
  projectId: string;
  teamId?: string | null;
  dueDate?: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  assignee?: User | null;
  project: Project;
  team?: Team | null;
}

export interface CreateTicketData {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  projectId: string;
  teamId?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface TicketFilters {
  status?: string[];
  priority?: string[];
  assigneeId?: string;
  projectId?: string;
  teamId?: string;
  search?: string;
}
