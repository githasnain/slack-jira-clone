import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageProjects } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get all projects with their teams and task counts
    const projects = await prisma.project.findMany({
      include: {
        teams: true,
        tasks: {
          select: {
            status: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    // Transform the data to match the expected format
    const transformedProjects = projects.map(project => {
      const taskCounts = project.tasks.reduce((acc, task) => {
        acc.total++
        if (task.status === 'DONE') acc.completed++
        else if (task.status === 'IN_PROGRESS') acc.inProgress++
        else if (task.status === 'TODO') acc.todo++
        return acc
      }, { total: 0, completed: 0, inProgress: 0, todo: 0 })

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        dueDate: project.dueDate?.toISOString(),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        teams: project.teams,
        members: project.members.map(member => ({
          id: member.user.id,
          name: member.user.name,
          image: member.user.image,
          role: member.role
        })),
        taskCount: taskCounts
      }
    })

    return NextResponse.json({ projects: transformedProjects })
  } catch (error) {
    console.error('Get projects error:', error)
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

    // Check if user can manage projects (admin only)
    const canManage = await canManageProjects()
    if (!canManage) {
      return NextResponse.json(
        { message: 'Only administrators can create projects' },
        { status: 403 }
      )
    }

    const { name, description, dueDate } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: 'Project name is required' },
        { status: 400 }
      )
    }

    // Create a new project in the database
    const newProject = await prisma.project.create({
      data: {
        name,
        description: description || '',
        status: 'ACTIVE',
        progress: 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        workspaceId: 'default-workspace', // You might want to get this from session or request
        members: {
          create: {
            userId: (session.user as any).id,
            role: 'OWNER'
          }
        }
      },
      include: {
        teams: true,
        tasks: {
          select: {
            status: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    // Transform the data to match the expected format
    const transformedProject = {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      progress: newProject.progress,
      dueDate: newProject.dueDate?.toISOString(),
      createdAt: newProject.createdAt.toISOString(),
      updatedAt: newProject.updatedAt.toISOString(),
      teams: newProject.teams,
      members: newProject.members.map(member => ({
        id: member.user.id,
        name: member.user.name,
        image: member.user.image,
        role: member.role
      })),
      taskCount: {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0
      }
    }

    return NextResponse.json(transformedProject, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
