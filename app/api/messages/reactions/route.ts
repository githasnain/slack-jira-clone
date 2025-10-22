import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messageId, emoji } = await request.json();

    if (!messageId || !emoji) {
      return NextResponse.json(
        { error: 'Message ID and emoji are required' },
        { status: 400 }
      );
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: session.user.id,
        emoji
      }
    });

    if (existingReaction) {
      // Remove reaction
      await prisma.messageReaction.delete({
        where: {
          id: existingReaction.id
        }
      });
      return NextResponse.json({
        message: 'Reaction removed',
        action: 'removed'
      });
    } else {
      // Add reaction
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId: session.user.id,
          emoji
        }
      });
      return NextResponse.json({
        message: 'Reaction added',
        action: 'added'
      });
    }

  } catch (error) {
    console.error('Toggle reaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
