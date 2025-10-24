import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const logs = await prisma.systemLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'csv') {
      const csvHeaders = 'ID,Action,Details,User,IP Address,User Agent,Created At\n';
      const csvData = logs.map(log => 
        `"${log.id}","${log.action}","${log.details}","${log.user?.name || 'N/A'}","${log.ipAddress}","${log.userAgent}","${log.createdAt}"`
      ).join('\n');
      
      const csvContent = csvHeaders + csvData;
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // JSON format
      return new NextResponse(JSON.stringify(logs, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

  } catch (error) {
    console.error('Export system logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


