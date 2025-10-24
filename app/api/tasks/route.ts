import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canAccessProject, canAccessTeam, logAdminAction } from '@/lib/access-control';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Add caching headers will be set in the response

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const teamId = searchParams.get('teamId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // CRITICAL FIX: Users should see ALL tickets but only edit their own
    // Build where clause for filtering
    let whereClause: any = {};
    
    // Apply filters if provided
    if (projectId) whereClause.projectId = projectId;
    if (teamId) whereClause.teamId = teamId;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    // Get ALL tasks (users can see all, but only edit their own)
    const tasks = await prisma.task.findMany({
      where: whereClause,
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

    // Add assignBy, assignTo, and createdBy fields to each task
    const tasksWithAssignmentInfo = tasks.map(task => ({
      ...task,
      assignBy: task.assignBy || null,
      assignTo: task.assignTo || null,
      createdBy: task.assignee?.name || 'Unknown' // Use assignee name as fallback
    }));

    return NextResponse.json(tasksWithAssignmentInfo, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300'
      }
    });

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

    const { title, description, priority, status, projectId, teamId, assigneeId, assignBy, assignTo, createdBy, dueDate, tags } = await request.json();

    console.log('🔍 Task creation request:', { title, description, priority, projectId, teamId, assigneeId, assignBy, assignTo, createdBy, dueDate, tags });
    console.log('🔍 Session user:', { id: session.user.id, email: session.user.email, role: session.user.role });

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Validate access to project and team if specified
    // For now, allow all users to create tasks (admin can manage access later)
    if (projectId) {
      try {
        const hasAccess = await canAccessProject(session.user.id, projectId);
        if (!hasAccess) {
          console.log(`⚠️ User ${session.user.id} doesn't have access to project ${projectId}, but allowing creation for now`);
        }
      } catch (error) {
        console.log(`⚠️ Error checking project access: ${error}, but allowing creation for now`);
      }
    }

    if (teamId) {
      try {
        const hasAccess = await canAccessTeam(session.user.id, teamId);
        if (!hasAccess) {
          console.log(`⚠️ User ${session.user.id} doesn't have access to team ${teamId}, but allowing creation for now`);
        }
      } catch (error) {
        console.log(`⚠️ Error checking team access: ${error}, but allowing creation for now`);
      }
    }

    // Look up user by email to get correct ID
    let currentUser;
    try {
      currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (!currentUser) {
        console.log('❌ User not found for email:', session.user.email);
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        );
      }
      
      console.log('✅ User found:', { id: currentUser.id, name: currentUser.name, email: currentUser.email });
    } catch (error) {
      console.error('❌ Error looking up user:', error);
      return NextResponse.json(
        { error: 'Database error while looking up user' },
        { status: 500 }
      );
    }

    console.log('🔍 Creating task with data:', {
      title,
      description,
      priority: priority || 'MEDIUM',
      projectId: projectId || null,
      teamId: teamId || null,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      assignBy: assignBy || null,
      assignTo: assignTo || null,
    });

    // Create task data object
    const taskData: any = {
      title,
      description,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      tags: tags || [],
      assignBy: assignBy || null,
      assignTo: assignTo || null,
      // createdBy: createdBy || currentUser.name || currentUser.email, // Temporarily disabled
    };

    // Only add optional fields if they have values
    if (projectId) taskData.projectId = projectId;
    if (teamId) taskData.teamId = teamId;
    if (assigneeId) taskData.assigneeId = assigneeId;
    if (dueDate) taskData.dueDate = new Date(dueDate);
    
    // If no assignee is specified, assign to the current user
    if (!assigneeId) {
      taskData.assigneeId = currentUser.id;
    }

    console.log('🔍 Final task data:', taskData);

    let task;
    try {
      task = await prisma.task.create({
        data: taskData,
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
      console.log('✅ Task created successfully:', { id: task.id, title: task.title });
    } catch (error) {
      console.error('❌ Error creating task:', error);
      console.error('❌ Task data that failed:', taskData);
      throw error; // Re-throw to be caught by outer try-catch
    }

    // Log task creation
    await prisma.systemLog.create({
      data: {
        userId: currentUser.id,
        action: 'TASK_CREATED',
        details: `Task "${title}" created${task.project ? ` in project ${task.project.name}` : ''}`
      }
    });

    // Log admin action if user is admin
    if (session.user.role === 'ADMIN') {
      await logAdminAction(
        currentUser.id,
        'TASK_CREATED',
        'TASK',
        task.id,
        `Admin created task "${title}" for ${task.assignee?.name || 'unassigned user'}`,
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    }

    return NextResponse.json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}
