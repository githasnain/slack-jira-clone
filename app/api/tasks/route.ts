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
    const status = searchParams.get('status');

    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    if (status) {
      where.status = status;
    }

    // If user is not admin, only show tasks assigned to them or their teams
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

    const tasks = await prisma.task.findMany({
      where,
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
      }
    });

    return NextResponse.json(tasks);

  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, description, priority, projectId, teamId, assigneeId, dueDate, tags } = await request.json();

    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and project are required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        projectId,
        teamId: teamId || null,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
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
      }
    });

    // Log task creation
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'TASK_CREATED',
        details: `Task "${title}" created in project ${task.project.name}`
      }
    });

    return NextResponse.json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
