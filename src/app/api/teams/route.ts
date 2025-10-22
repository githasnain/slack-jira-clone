import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageTeams } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Get teams for the specified project
    const teams = await prisma.team.findMany({
      where: {
        projectId: projectId
      },
      include: {
        tasks: {
          select: {
            status: true
          }
        }
      }
    })

    // Transform the data to include task counts
    const transformedTeams = teams.map(team => {
      const taskCounts = team.tasks.reduce((acc, task) => {
        acc.total++
        if (task.status === 'DONE') acc.completed++
        else if (task.status === 'IN_PROGRESS') acc.inProgress++
        else if (task.status === 'TODO') acc.todo++
        return acc
      }, { total: 0, completed: 0, inProgress: 0, todo: 0 })

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        projectId: team.projectId,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
        taskCount: taskCounts
      }
    })

    return NextResponse.json({ teams: transformedTeams })
  } catch (error) {
    console.error('Get teams error:', error)
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

    // Check if user can manage teams (admin only)
    const canManage = await canManageTeams()
    if (!canManage) {
      return NextResponse.json(
        { message: 'Only administrators can create teams' },
        { status: 403 }
      )
    }

    const { name, description, projectId } = await request.json()

    if (!name || !projectId) {
      return NextResponse.json(
        { message: 'Team name and project ID are required' },
        { status: 400 }
      )
    }

    // Create a new team in the database
    const newTeam = await prisma.team.create({
      data: {
        name,
        description: description || '',
        projectId: projectId
      },
      include: {
        tasks: {
          select: {
            status: true
          }
        }
      }
    })

    // Transform the data to include task counts
    const transformedTeam = {
      id: newTeam.id,
      name: newTeam.name,
      description: newTeam.description,
      projectId: newTeam.projectId,
      createdAt: newTeam.createdAt.toISOString(),
      updatedAt: newTeam.updatedAt.toISOString(),
      taskCount: {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0
      }
    }

    return NextResponse.json(transformedTeam, { status: 201 })
  } catch (error) {
    console.error('Create team error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
