import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Check if user is member of the channel
    const channelMember = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId: session.user.id
      }
    });

    if (!channelMember && session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not a member of this channel' },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        channelId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return NextResponse.json(messages.reverse()); // Reverse to show oldest first

  } catch (error) {
    console.error('Get messages error:', error);
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

    const { content, channelId, parentId, type = 'TEXT' } = await request.json();

    if (!content || !channelId) {
      return NextResponse.json(
        { error: 'Content and channel ID are required' },
        { status: 400 }
      );
    }

    // Check if user is member of the channel
    const channelMember = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId: session.user.id
      }
    });

    if (!channelMember && session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not a member of this channel' },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        type: type as any,
        channelId,
        userId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        replies: {
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
        attachments: true
      }
    });

    // Log message creation
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'MESSAGE_SENT',
        details: `Message sent in channel ${channelId}`
      }
    });

    return NextResponse.json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
