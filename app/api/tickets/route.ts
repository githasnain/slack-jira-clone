import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating tickets
const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED']).default('DRAFT'),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.number().int().positive().optional(),
  channelId: z.number().int().positive().optional(),
});

// GET /api/tickets - Get all tickets
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedToId = searchParams.get('assignedToId');
    const channelId = searchParams.get('channelId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = parseInt(assignedToId);
    if (channelId) where.channelId = parseInt(channelId);

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          assignedBy: {
            select: { id: true, name: true, email: true }
          },
          channel: {
            select: { id: true, name: true, description: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ticket.count({ where })
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = createTicketSchema.parse(body);
    
    // Check if assignedToId exists (if provided)
    if (validatedData.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: validatedData.assignedToId }
      });
      
      if (!assignedUser) {
        return NextResponse.json(
          { error: 'Assigned user not found' },
          { status: 400 }
        );
      }
    }

    // Check if channelId exists (if provided)
    if (validatedData.channelId) {
      const channel = await prisma.channel.findUnique({
        where: { id: validatedData.channelId }
      });
      
      if (!channel) {
        return NextResponse.json(
          { error: 'Channel not found' },
          { status: 400 }
        );
      }
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        category: validatedData.category,
        tags: validatedData.tags,
        status: validatedData.status,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        assignedToId: validatedData.assignedToId,
        assignedById: parseInt(session.user.id),
        channelId: validatedData.channelId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        assignedBy: {
          select: { id: true, name: true, email: true }
        },
        channel: {
          select: { id: true, name: true, description: true }
        }
      }
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}