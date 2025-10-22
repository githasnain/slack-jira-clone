import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const teamId = searchParams.get('teamId')
    const status = searchParams.get('status')

    // Build where clause for filtering
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (teamId) where.teamId = teamId
    if (status) where.status = status

    // Get tickets with filters
    const tickets = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const transformedTickets = tickets.map(ticket => ({
      id: ticket.id,
      serialNumber: tickets.indexOf(ticket) + 1, // Simple serial number
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignee: ticket.assignee ? {
        id: ticket.assignee.id,
        name: ticket.assignee.name,
        image: ticket.assignee.image
      } : null,
      createdBy: {
        id: (session.user as any).id,
        name: session.user?.name || 'User',
        image: session.user?.image || ''
      },
      assignedBy: ticket.assignee ? {
        id: (session.user as any).id,
        name: session.user?.name || 'User',
        image: session.user?.image || ''
      } : null,
      project: {
        id: ticket.project.id,
        name: ticket.project.name
      },
      team: ticket.team ? {
        id: ticket.team.id,
        name: ticket.team.name
      } : null,
      dueDate: ticket.dueDate?.toISOString() || null,
      tags: ticket.tags,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      isUpdated: false
    }))

    return NextResponse.json({ tickets: transformedTickets })
  } catch (error) {
    console.error('Get tickets error:', error)
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

    const { 
      title, 
      description, 
      priority, 
      assigneeId, 
      projectId, 
      teamId, 
      dueDate 
    } = await request.json()

    if (!title || !projectId) {
      return NextResponse.json(
        { message: 'Title and project ID are required' },
        { status: 400 }
      )
    }

    // Create a new ticket in the database
    const newTicket = await prisma.task.create({
      data: {
        title,
        description: description || '',
        priority: priority || 'MEDIUM',
        assigneeId: assigneeId || null,
        projectId: projectId,
        teamId: teamId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: []
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Transform the data to match the expected format
    const transformedTicket = {
      id: newTicket.id,
      serialNumber: 0, // Will be calculated on the frontend
      title: newTicket.title,
      description: newTicket.description,
      status: newTicket.status,
      priority: newTicket.priority,
      assignee: newTicket.assignee ? {
        id: newTicket.assignee.id,
        name: newTicket.assignee.name,
        image: newTicket.assignee.image
      } : null,
      createdBy: {
        id: (session.user as any).id,
        name: session.user?.name || 'User',
        image: session.user?.image || ''
      },
      assignedBy: newTicket.assignee ? {
        id: (session.user as any).id,
        name: session.user?.name || 'User',
        image: session.user?.image || ''
      } : null,
      project: {
        id: newTicket.project.id,
        name: newTicket.project.name
      },
      team: newTicket.team ? {
        id: newTicket.team.id,
        name: newTicket.team.name
      } : null,
      dueDate: newTicket.dueDate?.toISOString() || null,
      tags: newTicket.tags,
      createdAt: newTicket.createdAt.toISOString(),
      updatedAt: newTicket.updatedAt.toISOString(),
      isUpdated: false
    }

    return NextResponse.json(transformedTicket, { status: 201 })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
