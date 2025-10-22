import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channels = await prisma.channel.findMany({
      orderBy: [
        { isMain: 'desc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            tickets: true
          }
        }
      }
    });

    const channelsWithCounts = channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      slug: channel.slug,
      isMain: channel.isMain,
      ticketCount: channel._count.tickets
    }));

    return NextResponse.json({
      channels: channelsWithCounts
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

