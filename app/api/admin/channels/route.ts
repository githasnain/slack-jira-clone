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

    const channels = await prisma.channel.findMany({
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
        _count: {
          select: {
            members: true,
            messages: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(channels);

  } catch (error) {
    console.error('Get channels error:', error);
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

    const { name, description, type = 'PUBLIC' } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Channel name is required' },
        { status: 400 }
      );
    }

    // Create workspace if it doesn't exist
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'Default Workspace',
          description: 'Default workspace for channels',
          slug: 'default-workspace'
        }
      });
    }

    // Create channel
    const channel = await prisma.channel.create({
      data: {
        name,
        description,
        type: type as any,
        workspaceId: workspace.id,
      }
    });

    // Add admin as channel member
    await prisma.channelMember.create({
      data: {
        channelId: channel.id,
        userId: session.user.id,
        role: 'ADMIN'
      }
    });

    // Log channel creation
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: 'CHANNEL_CREATED',
        details: `Channel "${name}" created`
      }
    });

    return NextResponse.json({
      message: 'Channel created successfully',
      channel
    });

  } catch (error) {
    console.error('Create channel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
