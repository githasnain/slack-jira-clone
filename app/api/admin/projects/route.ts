import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        tasks: true,
        _count: {
          select: {
            tasks: true,
            members: true,
            teams: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(projects);

  } catch (error) {
    console.error('Get projects error:', error);
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, dueDate } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create workspace if it doesn't exist
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'Default Workspace',
          description: 'Default workspace for projects',
          slug: 'default-workspace'
        }
      });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        workspaceId: workspace.id,
      }
    });

    // Create default teams for the project
    const teamTypes = ['FRONTEND', 'BACKEND', 'DESIGN'];
    const teams = await Promise.all(
      teamTypes.map(type => 
        prisma.team.create({
          data: {
            name: `${type.charAt(0) + type.slice(1).toLowerCase()} Team`,
            description: `${type.charAt(0) + type.slice(1).toLowerCase()} development team`,
            type: type as any,
            projectId: project.id,
          }
        })
      )
    );

    // Log project creation
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'PROJECT_CREATED',
        details: `Project "${name}" created with ${teams.length} teams`
      }
    });

    return NextResponse.json({
      message: 'Project created successfully',
      project: {
        ...project,
        teams
      }
    });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
