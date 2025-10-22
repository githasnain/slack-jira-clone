export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'ON_HOLD';
  progress: number;
  dueDate?: Date | null;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  workspace: Workspace;
  members: ProjectMember[];
  teams: Team[];
  tasks: Task[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: Date;
  
  project: Project;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  
  project: Project;
  tasks: Task[];
}

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  
  channels: Channel[];
  projects: Project[];
}

export interface CreateProjectData {
  name: string;
  description?: string;
  dueDate?: Date;
  workspaceId: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'ON_HOLD';
  progress?: number;
  dueDate?: Date;
}
