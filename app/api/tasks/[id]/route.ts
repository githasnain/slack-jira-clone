import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { status, priority, assigneeId, title, description, dueDate, tags } = await request.json();

    // Check if task exists and user has permission to update it
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        team: {
          include: {
            members: true
          }
        }
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check permissions - user must be admin, assignee, or team member
    const canUpdate = session.user?.role === 'ADMIN' || 
                     existingTask.assigneeId === session.user.id ||
                     existingTask.team?.members.some(member => member.userId === session.user.id);

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) updateData.tags = tags;

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
        userId: session.user.id,
        action: 'TASK_UPDATED',
        details: `Task "${task.title}" updated - Status: ${task.status}, Priority: ${task.priority}`
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const task = await prisma.task.delete({
      where: { id }
    });

    // Log task deletion
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'TASK_DELETED',
        details: `Task "${task.title}" deleted`
      }
    });

    return NextResponse.json({
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
