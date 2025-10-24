import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Update project (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 PUT /api/projects/[id] called');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Session:', session?.user?.email, 'Role:', session?.user?.role);
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can update projects
    if (session.user?.role !== 'ADMIN') {
      console.log('❌ User is not admin, role:', session.user?.role);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    console.log('🔍 Project ID to update:', id);

    const body = await request.json();
    console.log('🔍 Request body:', body);
    
    const { name, description, dueDate } = body;

    if (!name) {
      console.log('❌ No project name provided');
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Check if project exists
    console.log('🔍 Checking if project exists...');
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { name: true, id: true }
    });

    if (!existingProject) {
      console.log('❌ Project not found:', id);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log('🔍 Project found:', existingProject.name);

    // Update project
    console.log('🔍 Updating project...');
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });

    console.log('✅ Project updated successfully');

    // Log admin action
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'PROJECT_UPDATED',
        details: `Admin updated project "${existingProject.name}" to "${name}"`
      }
    });

    console.log('✅ Admin action logged');

    return NextResponse.json({
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}

// Delete project (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 DELETE /api/projects/[id] called');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Session:', session?.user?.email, 'Role:', session?.user?.role);
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can delete projects
    if (session.user?.role !== 'ADMIN') {
      console.log('❌ User is not admin, role:', session.user?.role);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    console.log('🔍 Project ID to delete:', id);

    // Check if project exists
    console.log('🔍 Checking if project exists...');
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { name: true, id: true }
    });

    if (!existingProject) {
      console.log('❌ Project not found:', id);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log('🔍 Project found:', existingProject.name);

    // Delete project (cascade will handle related records)
    console.log('🔍 Deleting project...');
    await prisma.project.delete({
      where: { id }
    });

    console.log('✅ Project deleted successfully');

    // Log admin action
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'PROJECT_DELETED',
        details: `Admin deleted project "${existingProject.name}"`
      }
    });

    console.log('✅ Admin action logged');

    return NextResponse.json({
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}
