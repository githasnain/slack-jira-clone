import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/access-control';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        uploads: {
          include: {
            uploader: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!documentRequest) {
      return NextResponse.json(
        { error: 'Document request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(documentRequest);

  } catch (error) {
    console.error('Get document request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { title, description, dueDate, isActive } = await request.json();

    const documentRequest = await prisma.documentRequest.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        uploads: {
          include: {
            uploader: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    // Log admin action
    await logAdminAction(
      session.user.id,
      'DOCUMENT_REQUEST_UPDATED',
      'DOCUMENT_REQUEST',
      documentRequest.id,
      `Admin updated document request: "${title}"`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'Document request updated successfully',
      documentRequest
    });

  } catch (error) {
    console.error('Update document request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Delete all associated uploads first
    await prisma.documentUpload.deleteMany({
      where: { documentRequestId: id }
    });

    // Delete the document request
    await prisma.documentRequest.delete({
      where: { id }
    });

    // Log admin action
    await logAdminAction(
      session.user.id,
      'DOCUMENT_REQUEST_DELETED',
      'DOCUMENT_REQUEST',
      id,
      `Admin deleted document request`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'Document request deleted successfully'
    });

  } catch (error) {
    console.error('Delete document request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

