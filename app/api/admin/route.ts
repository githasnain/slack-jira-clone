import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserProjects, getUserTeams, getUserTickets, logAdminAction, getAdminAuditTrail } from '@/lib/access-control';

// Get all projects, teams, and tickets (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        const [projects, teams, tickets, auditTrail] = await Promise.all([
          prisma.project.findMany({
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
              tasks: {
                include: {
                  assignee: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          }),
          prisma.team.findMany({
            include: {
              project: true,
              members: {
                include: { user: true }
              },
              tasks: {
                include: {
                  assignee: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          }),
          prisma.task.findMany({
            include: {
              assignee: {
                select: { id: true, name: true, email: true }
              },
              project: {
                select: { id: true, name: true }
              },
              team: {
                select: { id: true, name: true, type: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
          getAdminAuditTrail(20)
        ]);

        return NextResponse.json({
          projects,
          teams,
          tickets,
          auditTrail,
          stats: {
            totalProjects: projects.length,
            totalTeams: teams.length,
            totalTickets: tickets.length,
            activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
            completedTickets: tickets.filter(t => t.status === 'DONE').length
          }
        });

      case 'projects':
        const allProjects = await prisma.project.findMany({
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
            tasks: {
              include: {
                assignee: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        });
        return NextResponse.json(allProjects);

      case 'teams':
        const allTeams = await prisma.team.findMany({
          include: {
            project: true,
            members: {
              include: { user: true }
            },
            tasks: {
              include: {
                assignee: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        });
        return NextResponse.json(allTeams);

      case 'tickets':
        const allTickets = await prisma.task.findMany({
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            },
            project: {
              select: { id: true, name: true }
            },
            team: {
              select: { id: true, name: true, type: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(allTickets);

      case 'audit':
        const auditLog = await getAdminAuditTrail(50);
        return NextResponse.json(auditLog);

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Assign ticket to user or team (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { action, ticketId, userId, teamId, projectId } = await request.json();

    if (!action || !ticketId) {
      return NextResponse.json(
        { error: 'Action and ticketId are required' },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let updatedTicket;
    let logDetails = '';

    switch (action) {
      case 'assign_user':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required for user assignment' },
            { status: 400 }
          );
        }

        updatedTicket = await prisma.task.update({
          where: { id: ticketId },
          data: { assigneeId: userId },
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          }
        });

        logDetails = `Admin assigned ticket to user ${updatedTicket.assignee?.name}`;
        break;

      case 'assign_team':
        if (!teamId) {
          return NextResponse.json(
            { error: 'teamId is required for team assignment' },
            { status: 400 }
          );
        }

        updatedTicket = await prisma.task.update({
          where: { id: ticketId },
          data: { teamId },
          include: {
            team: {
              select: { id: true, name: true, type: true }
            }
          }
        });

        logDetails = `Admin assigned ticket to team ${updatedTicket.team?.name}`;
        break;

      case 'assign_project':
        if (!projectId) {
          return NextResponse.json(
            { error: 'projectId is required for project assignment' },
            { status: 400 }
          );
        }

        updatedTicket = await prisma.task.update({
          where: { id: ticketId },
          data: { projectId },
          include: {
            project: {
              select: { id: true, name: true }
            }
          }
        });

        logDetails = `Admin assigned ticket to project ${updatedTicket.project?.name}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Log admin action
    await logAdminAction(
      currentUser.id,
      `TICKET_${action.toUpperCase()}`,
      'TASK',
      ticketId,
      logDetails,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'Ticket assignment updated successfully',
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Admin assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

