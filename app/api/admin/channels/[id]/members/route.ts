import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Add user to channel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 POST /api/admin/channels/[id]/members - Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Session:', session ? 'Authenticated' : 'Not authenticated');
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }
    
    if (session.user?.role !== 'ADMIN') {
      console.log('❌ User is not admin:', session.user?.role);
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const requestBody = await request.json();
    console.log('🔍 Request body:', requestBody);
    
    const { userId, role = 'MEMBER' } = requestBody;
    const { id: channelId } = await params;
    
    console.log('🔍 Processing:', { channelId, userId, role });

    if (!userId) {
      console.log('❌ No userId provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!channelId) {
      console.log('❌ No channelId in params');
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if channel exists
    const channel = await prisma.channel.findUnique({
      where: { id: channelId }
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this channel' },
        { status: 400 }
      );
    }

    // Add user to channel
    const channelMember = await prisma.channelMember.create({
      data: {
        channelId,
        userId,
        role: role as any
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        channel: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_ADDED_TO_CHANNEL',
        details: `Added ${user.name} to channel ${channel.name}`
      }
    });

    return NextResponse.json({
      message: 'User added to channel successfully',
      channelMember
    });

  } catch (error) {
    console.error('Add user to channel error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      channelId: params.id
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

// Remove user from channel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 DELETE /api/admin/channels/[id]/members - Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Session:', session ? 'Authenticated' : 'Not authenticated');
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }
    
    if (session.user?.role !== 'ADMIN') {
      console.log('❌ User is not admin:', session.user?.role);
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { id: channelId } = await params;
    
    console.log('🔍 Processing DELETE:', { channelId, userId });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the membership
    const channelMember = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        channel: {
          select: {
            name: true
          }
        }
      }
    });

    if (!channelMember) {
      return NextResponse.json(
        { error: 'User is not a member of this channel' },
        { status: 404 }
      );
    }

    await prisma.channelMember.delete({
      where: {
        id: channelMember.id
      }
    });

    console.log('✅ User removed from channel successfully');

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_REMOVED_FROM_CHANNEL',
        details: `Removed ${channelMember.user.name} from channel ${channelMember.channel.name}`
      }
    });

    return NextResponse.json({
      message: 'User removed from channel successfully'
    });

  } catch (error) {
    console.error('Remove user from channel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
