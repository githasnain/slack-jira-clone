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

    const { userId, projectId, teamId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    let result;
    let logDetails = '';

    switch (action) {
      case 'assign_to_project':
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required for project assignment' },
            { status: 400 }
          );
        }

        // Add user to project
        await prisma.projectMember.create({
          data: {
            userId,
            projectId,
            role: 'MEMBER'
          }
        });

        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { name: true }
        });

        logDetails = `Admin assigned user to project "${project?.name}"`;
        break;

      case 'assign_to_team':
        if (!teamId) {
          return NextResponse.json(
            { error: 'Team ID is required for team assignment' },
            { status: 400 }
          );
        }

        // Add user to team
        await prisma.teamMember.create({
          data: {
            userId,
            teamId,
            role: 'MEMBER'
          }
        });

        const team = await prisma.team.findUnique({
          where: { id: teamId },
          include: {
            project: {
              select: { name: true }
            }
          }
        });

        logDetails = `Admin assigned user to team "${team?.name}" in project "${team?.project?.name}"`;
        break;

      case 'remove_from_project':
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required for project removal' },
            { status: 400 }
          );
        }

        await prisma.projectMember.deleteMany({
          where: {
            userId,
            projectId
          }
        });

        const projectToRemove = await prisma.project.findUnique({
          where: { id: projectId },
          select: { name: true }
        });

        logDetails = `Admin removed user from project "${projectToRemove?.name}"`;
        break;

      case 'remove_from_team':
        if (!teamId) {
          return NextResponse.json(
            { error: 'Team ID is required for team removal' },
            { status: 400 }
          );
        }

        await prisma.teamMember.deleteMany({
          where: {
            userId,
            teamId
          }
        });

        const teamToRemove = await prisma.team.findUnique({
          where: { id: teamId },
          include: {
            project: {
              select: { name: true }
            }
          }
        });

        logDetails = `Admin removed user from team "${teamToRemove?.name}"`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Log admin action
    await prisma.systemLog.create({
      data: {
        userId: currentUser.id,
        action: `USER_${action.toUpperCase()}`,
        details: logDetails
      }
    });

    return NextResponse.json({
      message: 'User assignment updated successfully',
      action,
      logDetails
    });

  } catch (error) {
    console.error('User assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

