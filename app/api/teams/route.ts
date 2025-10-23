import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get teams based on user role
    let teams;
    if (session.user.role === 'ADMIN') {
      // Admin sees all teams
      teams = await prisma.team.findMany({
        include: {
          project: {
            select: { id: true, name: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });
    } else {
      // Regular users see only teams they're members of
      teams = await prisma.team.findMany({
        where: {
          members: {
            some: {
              id: session.user.id
            }
          }
        },
        include: {
          project: {
            select: { id: true, name: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });
    }

    return NextResponse.json(teams);

  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { name, description, type, projectId } = await request.json();

    if (!name || !projectId) {
      return NextResponse.json(
        { error: 'Team name and project are required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        description,
        type: type || 'FRONTEND',
        projectId,
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    // Log team creation
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'TEAM_CREATED',
        details: `Team "${name}" created in project "${project.name}"`
      }
    });

    return NextResponse.json({
      message: 'Team created successfully',
      team
    });

  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}