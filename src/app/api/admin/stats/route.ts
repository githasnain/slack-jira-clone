import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get system statistics
    const [
      totalUsers,
      adminUsers,
      memberUsers,
      totalProjects,
      totalTeams,
      totalTickets
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.project.count(),
      prisma.team.count(),
      prisma.task.count()
    ])

    const stats = {
      totalUsers,
      adminUsers,
      memberUsers,
      totalProjects,
      totalTeams,
      totalTickets
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
