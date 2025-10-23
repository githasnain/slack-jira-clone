import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the actual values
    const { id } = await params;
    
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
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

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);

  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the actual values
    const { id } = await params;
    
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, description, priority, projectId, teamId, assigneeId, assignBy, assignTo, dueDate, tags, status } = await request.json();

    // Check if task exists and user owns it
    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: { assigneeId: true }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Get the current user's ID from the database
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (existingTask.assigneeId !== currentUser?.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only edit your own tasks' },
        { status: 403 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create update data object
    const updateData: any = {
      title,
      description,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      tags: tags || [],
      assignBy: assignBy || null,
      assignTo: assignTo || null,
    };

    // Only add optional fields if they have values
    if (projectId) updateData.projectId = projectId;
    if (teamId) updateData.teamId = teamId;
    if (assigneeId) updateData.assigneeId = assigneeId;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (status) updateData.status = status;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
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

    // Log task update
    await prisma.systemLog.create({
      data: {
        userId: currentUser?.id || session.user.id,
        action: 'TASK_UPDATED',
        details: `Task "${title}" updated`
      }
    });

    return NextResponse.json({
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the actual values
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if task exists and user owns it
    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: { assigneeId: true, title: true }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Get the current user's ID from the database
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (existingTask.assigneeId !== currentUser?.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only delete your own tasks' },
        { status: 403 }
      );
    }

    // Delete the task
    const deletedTask = await prisma.task.delete({
      where: { id }
    });

    // Log task deletion (with error handling)
    try {
      await prisma.systemLog.create({
        data: {
          userId: currentUser?.id || session.user.id,
          action: 'TASK_DELETED',
          details: `Task "${existingTask.title}" deleted`
        }
      });
    } catch (logError) {
      console.error('Failed to create system log:', logError);
      // Don't fail the deletion if logging fails
    }

    return NextResponse.json({
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the actual values
    const { id } = await params;
    
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if task exists and user owns it
    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: { assigneeId: true }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Get the current user's ID from the database
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (existingTask.assigneeId !== currentUser?.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only update your own tasks' },
        { status: 403 }
      );
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Update only the status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
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

    // Log status update
    await prisma.systemLog.create({
      data: {
        userId: currentUser?.id || session.user.id,
        action: 'TASK_STATUS_UPDATED',
        details: `Task status updated to ${status}`
      }
    });

    return NextResponse.json({
      message: 'Task status updated successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('Update task status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}