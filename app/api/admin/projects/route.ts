import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
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