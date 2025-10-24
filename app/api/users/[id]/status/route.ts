import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get user status
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        lastActive: true,
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: user.status,
      lastActive: user.lastActive,
      isActive: user.isActive
    });

  } catch (error) {
    console.error('Get user status error:', error);
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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    // Only allow users to update their own status
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Can only update your own status' },
        { status: 403 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: status,
        lastActive: new Date()
      },
      select: {
        id: true,
        status: true,
        lastActive: true
      }
    });

    return NextResponse.json({
      message: 'Status updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
