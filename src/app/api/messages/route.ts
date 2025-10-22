import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Demo messages for development
const demoMessages = [
  {
    id: 'msg_1',
    content: 'Hey team! Welcome to our new workspace. Let\'s make this project amazing! 🚀',
    type: 'TEXT',
    channelId: 'general',
    userId: '1',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    user: {
      id: '1',
      name: 'John Doe',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      status: 'ONLINE'
    },
    reactions: [
      { emoji: '👍', count: 3, users: ['Jane', 'Bob', 'Alice'] },
      { emoji: '🎉', count: 1, users: ['Jane'] }
    ],
    attachments: []
  },
  {
    id: 'msg_2',
    content: 'Thanks for the update John! The new features look amazing. I\'ll review the code changes this afternoon.',
    type: 'TEXT',
    channelId: 'general',
    userId: '2',
    createdAt: '2024-01-15T10:35:00Z',
    updatedAt: '2024-01-15T10:35:00Z',
    user: {
      id: '2',
      name: 'Jane Smith',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      status: 'AWAY'
    },
    reactions: [
      { emoji: '👀', count: 2, users: ['John', 'Bob'] }
    ],
    attachments: []
  },
  {
    id: 'msg_3',
    content: 'I\'ve completed the database migration. Everything looks good on my end. Ready for the next phase!',
    type: 'TEXT',
    channelId: 'general',
    userId: '3',
    createdAt: '2024-01-15T10:42:00Z',
    updatedAt: '2024-01-15T10:42:00Z',
    user: {
      id: '3',
      name: 'Bob Wilson',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      status: 'ONLINE'
    },
    reactions: [
      { emoji: '✅', count: 1, users: ['John'] }
    ],
    attachments: []
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Filter messages by channel if specified
    let filteredMessages = demoMessages
    if (channelId) {
      filteredMessages = demoMessages.filter(msg => msg.channelId === channelId)
    }

    // Apply pagination
    const paginatedMessages = filteredMessages.slice(offset, offset + limit)

    return NextResponse.json({
      messages: paginatedMessages,
      pagination: {
        total: filteredMessages.length,
        limit,
        offset,
        hasMore: offset + limit < filteredMessages.length
      }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { content, channelId, type = 'TEXT' } = await request.json()

    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      )
    }

    // Create a new message with demo data
    const newMessage = {
      id: Date.now().toString(),
      content,
      type,
      channelId: channelId || 'general',
      userId: (session.user as any).id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: (session.user as any).id,
        name: session.user?.name || 'User',
        image: session.user?.image || '',
        status: 'ONLINE'
      },
      reactions: [],
      attachments: []
    }

    // In a real app, you would save to database here
    // For demo purposes, we'll just return the created message
    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Create message error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
