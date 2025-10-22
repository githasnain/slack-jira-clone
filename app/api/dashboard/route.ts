import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get date 7 days ago for chart data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Parallel queries for dashboard data
    const [
      totalTickets,
      openTickets,
      activeUsers,
      ticketsByStatus,
      ticketsByPriority,
      ticketsByDay,
      recentTickets
    ] = await Promise.all([
      // Total tickets count
      prisma.ticket.count(),

      // Open tickets count (not draft, not closed)
      prisma.ticket.count({
        where: {
          status: {
            notIn: ['draft', 'closed', 'resolved']
          }
        }
      }),

      // Active users in past 24 hours
      prisma.user.count({
        where: {
          OR: [
            {
              createdTickets: {
                some: {
                  createdAt: {
                    gte: twentyFourHoursAgo
                  }
                }
              }
            },
            {
              assignedTickets: {
                some: {
                  updatedAt: {
                    gte: twentyFourHoursAgo
                  }
                }
              }
            }
          ]
        }
      }),

      // Tickets by status
      prisma.ticket.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),

      // Tickets by priority
      prisma.ticket.groupBy({
        by: ['priority'],
        _count: {
          priority: true
        }
      }),

      // Tickets created per day (last 7 days)
      prisma.ticket.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),

      // Recent tickets
      prisma.ticket.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          },
          channel: {
            select: { id: true, name: true, slug: true }
          }
        }
      })
    ]);

    // Process chart data
    const statusData = ticketsByStatus.map(item => ({
      status: item.status,
      count: item._count.status
    }));

    const priorityData = ticketsByPriority.map(item => ({
      priority: item.priority,
      count: item._count.priority
    }));

    // Process daily tickets data
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayTickets = ticketsByDay.find(t => {
        const ticketDate = new Date(t.createdAt);
        ticketDate.setHours(0, 0, 0, 0);
        return ticketDate.getTime() === date.getTime();
      });

      dailyData.push({
        date: date.toISOString().split('T')[0],
        tickets: dayTickets?._count.id || 0
      });
    }

    return NextResponse.json({
      stats: {
        totalTickets,
        openTickets,
        activeUsers
      },
      charts: {
        statusData,
        priorityData,
        dailyData
      },
      recentTickets
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

