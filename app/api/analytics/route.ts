import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const teamId = searchParams.get('teamId');
    const period = searchParams.get('period') || '30'; // days

    // Validate period parameter
    const periodDays = parseInt(period);
    if (isNaN(periodDays) || periodDays < 1 || periodDays > 365) {
      return NextResponse.json(
        { error: 'Invalid period parameter. Must be between 1 and 365 days.' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Base where clause
    const where: any = {
      createdAt: {
        gte: startDate
      }
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    // If user is not admin, filter by their access
    if (session.user?.role !== 'ADMIN') {
      where.OR = [
        { assigneeId: session.user.id },
        {
          team: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      ];
    }

    // Get task statistics
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      reviewTasks,
      tasksByPriority,
      tasksByStatus,
      tasksByTeam,
      recentActivity,
      projectStats
    ] = await Promise.all([
      // Total tasks
      prisma.task.count({ where }),
      
      // Completed tasks
      prisma.task.count({ 
        where: { ...where, status: 'DONE' } 
      }),
      
      // In progress tasks
      prisma.task.count({ 
        where: { ...where, status: 'IN_PROGRESS' } 
      }),
      
      // Todo tasks
      prisma.task.count({ 
        where: { ...where, status: 'TODO' } 
      }),
      
      // Review tasks
      prisma.task.count({ 
        where: { ...where, status: 'IN_REVIEW' } 
      }),
      
      // Tasks by priority
      prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: {
          priority: true
        }
      }),
      
      // Tasks by status
      prisma.task.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true
        }
      }),
      
      // Tasks by team
      prisma.task.groupBy({
        by: ['teamId'],
        where: {
          ...where,
          teamId: { not: null }
        },
        _count: {
          teamId: true
        }
      }),
      
      // Recent activity (last 7 days)
      prisma.task.findMany({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          project: {
            select: {
              id: true,
              name: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      
      // Project statistics
      prisma.project.findMany({
        include: {
          _count: {
            select: {
              tasks: true,
              members: true,
              teams: true
            }
          },
          tasks: {
            select: {
              status: true,
              priority: true
            }
          }
        }
      })
    ]);

    // Calculate completion rate with proper rounding
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100 * 100) / 100 : 0;

    // Calculate average completion time (mock data for demo)
    const avgCompletionTime = 3.2; // days

    // Get team names for tasks by team
    const teamIds = tasksByTeam.map(t => t.teamId).filter((id): id is string => Boolean(id));
    const teams = await prisma.team.findMany({
      where: {
        id: { in: teamIds }
      },
      select: {
        id: true,
        name: true,
        type: true
      }
    });

    const tasksByTeamWithNames = tasksByTeam.map(t => {
      const team = teams.find(team => team.id === t.teamId);
      return {
        teamId: t.teamId,
        teamName: team?.name || 'Unknown',
        teamType: team?.type || 'UNKNOWN',
        count: t._count.teamId
      };
    });

    return NextResponse.json({
      overview: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        reviewTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        avgCompletionTime
      },
      tasksByPriority: tasksByPriority.map(t => ({
        priority: t.priority,
        count: t._count.priority
      })),
      tasksByStatus: tasksByStatus.map(t => ({
        status: t.status,
        count: t._count.status
      })),
      tasksByTeam: tasksByTeamWithNames,
      recentActivity,
      projectStats: projectStats.map(project => ({
        id: project.id,
        name: project.name,
        totalTasks: project._count.tasks,
        completedTasks: project.tasks.filter(t => t.status === 'DONE').length,
        members: project._count.members,
        teams: project._count.teams,
        completionRate: project._count.tasks > 0 
          ? Math.round((project.tasks.filter(t => t.status === 'DONE').length / project._count.tasks) * 100 * 100) / 100
          : 0
      }))
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    
    // Return structured error response
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}
