import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// @ts-ignore
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const includeUsers = searchParams.get('includeUsers') === 'true';

    // Fetch all tickets with relations
    const tickets = await prisma.ticket.findMany({
      include: {
        assignedBy: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        channel: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch users if requested
    let users: any[] = [];
    if (includeUsers) {
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              ticketsCreated: true,
              ticketsAssigned: true
            }
          }
        }
      });
    }

    if (format === 'xlsx') {
      return await generateXLSX(tickets, users, includeUsers);
    } else {
      return await generateCSV(tickets, users, includeUsers);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateCSV(tickets: any[], users: any[], includeUsers: boolean) {
  // Prepare tickets data for CSV
  const ticketsData = tickets.map(ticket => ({
    'Ticket ID': ticket.id,
    'Title': ticket.title,
    'Description': ticket.description ? ticket.description.replace(/<[^>]*>/g, '') : '', // Strip HTML
    'Status': ticket.status,
    'Priority': ticket.priority,
    'Category': ticket.category,
    'Channel': ticket.channel.name,
    'Creator': ticket.assignedBy.name || ticket.assignedBy.email,
    'Creator Email': ticket.assignedBy.email,
    'Assignee': ticket.assignedTo ? (ticket.assignedTo.name || ticket.assignedTo.email) : 'Unassigned',
    'Assignee Email': ticket.assignedTo ? ticket.assignedTo.email : '',
    'Tags': ticket.tags.join(', '),
    'Created At': new Date(ticket.createdAt).toLocaleString(),
    'Updated At': new Date(ticket.updatedAt).toLocaleString(),
    'Due Date': ticket.dueDate ? new Date(ticket.dueDate).toLocaleString() : ''
  }));

  let csvContent = '';
  
  if (includeUsers && users.length > 0) {
    // Prepare users data for CSV
    const usersData = users.map(user => ({
      'User ID': user.id,
      'Name': user.name || '',
      'Email': user.email,
      'Role': user.role,
      'Created At': new Date(user.createdAt).toLocaleString(),
      'Tickets Created': user._count.ticketsCreated,
      'Tickets Assigned': user._count.ticketsAssigned
    }));

    // Combine tickets and users data
    const parser = new Parser();
    csvContent = 'TICKETS\n' + parser.parse(ticketsData) + '\n\nUSERS\n' + parser.parse(usersData);
  } else {
    const parser = new Parser();
    csvContent = parser.parse(ticketsData);
  }

  const filename = `tickets-export-${new Date().toISOString().split('T')[0]}.csv`;
  
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

async function generateXLSX(tickets: any[], users: any[], includeUsers: boolean) {
  const workbook = new ExcelJS.Workbook();
  
  // Add metadata
  workbook.creator = 'Slack Jira Clone';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create tickets worksheet
  const ticketsSheet = workbook.addWorksheet('Tickets');
  
  // Define columns for tickets
  ticketsSheet.columns = [
    { header: 'Ticket ID', key: 'id', width: 15 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Channel', key: 'channel', width: 20 },
    { header: 'Creator', key: 'creator', width: 25 },
    { header: 'Creator Email', key: 'creatorEmail', width: 30 },
    { header: 'Assignee', key: 'assignee', width: 25 },
    { header: 'Assignee Email', key: 'assigneeEmail', width: 30 },
    { header: 'Tags', key: 'tags', width: 30 },
    { header: 'Created At', key: 'createdAt', width: 20 },
    { header: 'Updated At', key: 'updatedAt', width: 20 },
    { header: 'Due Date', key: 'dueDate', width: 20 }
  ];

  // Add tickets data
  tickets.forEach(ticket => {
    ticketsSheet.addRow({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description ? ticket.description.replace(/<[^>]*>/g, '') : '',
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      channel: ticket.channel.name,
      creator: ticket.assignedBy.name || ticket.assignedBy.email,
      creatorEmail: ticket.assignedBy.email,
      assignee: ticket.assignedTo ? (ticket.assignedTo.name || ticket.assignedTo.email) : 'Unassigned',
      assigneeEmail: ticket.assignedTo ? ticket.assignedTo.email : '',
      tags: ticket.tags.join(', '),
      createdAt: new Date(ticket.createdAt).toLocaleString(),
      updatedAt: new Date(ticket.updatedAt).toLocaleString(),
      dueDate: ticket.dueDate ? new Date(ticket.dueDate).toLocaleString() : ''
    });
  });

  // Style the header row
  ticketsSheet.getRow(1).font = { bold: true };
  ticketsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6F3FF' }
  };

  // Add users worksheet if requested
  if (includeUsers && users.length > 0) {
    const usersSheet = workbook.addWorksheet('Users');
    
    usersSheet.columns = [
      { header: 'User ID', key: 'id', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Tickets Created', key: 'ticketsCreated', width: 15 },
      { header: 'Tickets Assigned', key: 'ticketsAssigned', width: 15 }
    ];

    users.forEach(user => {
      usersSheet.addRow({
        id: user.id,
        name: user.name || '',
        email: user.email,
        role: user.role,
        createdAt: new Date(user.createdAt).toLocaleString(),
        ticketsCreated: user._count.ticketsCreated,
        ticketsAssigned: user._count.ticketsAssigned
      });
    });

    // Style the header row
    usersSheet.getRow(1).font = { bold: true };
    usersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `tickets-export-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

