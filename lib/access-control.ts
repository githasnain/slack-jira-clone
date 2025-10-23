import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserAccess {
  userId: string;
  role: string;
  projects: string[];
  teams: string[];
  canViewAll: boolean;
}

export interface ProjectTeamAccess {
  projectId: string;
  teamId: string;
  canAccess: boolean;
}

/**
 * Get user's access permissions based on their role and memberships
 */
export async function getUserAccess(userId: string): Promise<UserAccess> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      projects: {
        include: { project: true }
      },
      teams: {
        include: { team: true }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isAdmin = user.role === 'ADMIN';
  const projectIds = isAdmin ? [] : user.projects.map(pm => pm.projectId);
  const teamIds = isAdmin ? [] : user.teams.map(tm => tm.teamId);

  return {
    userId: user.id,
    role: user.role,
    projects: projectIds,
    teams: teamIds,
    canViewAll: isAdmin
  };
}

/**
 * Check if user can access a specific project
 */
export async function canAccessProject(userId: string, projectId: string): Promise<boolean> {
  const access = await getUserAccess(userId);
  
  if (access.canViewAll) return true;
  
  return access.projects.includes(projectId);
}

/**
 * Check if user can access a specific team
 */
export async function canAccessTeam(userId: string, teamId: string): Promise<boolean> {
  const access = await getUserAccess(userId);
  
  if (access.canViewAll) return true;
  
  return access.teams.includes(teamId);
}

/**
 * Check if user can access a specific ticket
 */
export async function canAccessTicket(userId: string, ticketId: string): Promise<boolean> {
  const ticket = await prisma.task.findUnique({
    where: { id: ticketId },
    include: {
      project: true,
      team: true
    }
  });

  if (!ticket) return false;

  const access = await getUserAccess(userId);
  
  if (access.canViewAll) return true;
  
  // Check if user is assigned to the ticket
  if (ticket.assigneeId === userId) return true;
  
  // Check if user has access to the project
  if (ticket.projectId && access.projects.includes(ticket.projectId)) return true;
  
  // Check if user has access to the team
  if (ticket.teamId && access.teams.includes(ticket.teamId)) return true;
  
  return false;
}

/**
 * Get filtered projects for user
 */
export async function getUserProjects(userId: string) {
  const access = await getUserAccess(userId);
  
  if (access.canViewAll) {
    return await prisma.project.findMany({
      include: {
        teams: {
          include: {
            members: {
              include: { user: true }
            }
          }
        },
        members: {
          include: { user: true }
        },
        _count: {
          select: {
            tasks: true,
            members: true,
            teams: true
          }
        }
      }
    });
  }
  
  return await prisma.project.findMany({
    where: {
      id: { in: access.projects }
    },
    include: {
      teams: {
        include: {
          members: {
            include: { user: true }
          }
        }
      },
      members: {
        include: { user: true }
      },
      _count: {
        select: {
          tasks: true,
          members: true,
          teams: true
        }
      }
    }
  });
}

/**
 * Get filtered teams for user
 */
export async function getUserTeams(userId: string) {
  const access = await getUserAccess(userId);
  
  if (access.canViewAll) {
    return await prisma.team.findMany({
      include: {
        project: true,
        members: {
          include: { user: true }
        }
      }
    });
  }
  
  return await prisma.team.findMany({
    where: {
      id: { in: access.teams }
    },
    include: {
      project: true,
      members: {
        include: { user: true }
      }
    }
  });
}

/**
 * Get filtered tickets for user
 */
export async function getUserTickets(userId: string, filters?: {
  projectId?: string;
  teamId?: string;
  status?: string;
  priority?: string;
}) {
  const access = await getUserAccess(userId);
  
  let whereClause: any = {};
  
  if (!access.canViewAll) {
    // Users can see tickets they are assigned to OR tickets from their projects/teams
    whereClause.OR = [
      { assigneeId: userId },
      { projectId: { in: access.projects } },
      { teamId: { in: access.teams } }
    ];
  }
  
  // Apply additional filters
  if (filters?.projectId) {
    whereClause.projectId = filters.projectId;
  }
  
  if (filters?.teamId) {
    whereClause.teamId = filters.teamId;
  }
  
  if (filters?.status) {
    whereClause.status = filters.status;
  }
  
  if (filters?.priority) {
    whereClause.priority = filters.priority;
  }
  
  return await prisma.task.findMany({
    where: whereClause,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      project: {
        select: {
          id: true,
          name: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Log admin actions for audit trail
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details: string,
  ipAddress?: string,
  userAgent?: string
) {
  return await prisma.adminAction.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
      userAgent
    }
  });
}

/**
 * Get admin audit trail
 */
export async function getAdminAuditTrail(limit: number = 50) {
  return await prisma.adminAction.findMany({
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
}
