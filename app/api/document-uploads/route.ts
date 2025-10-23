import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentRequestId = formData.get('documentRequestId') as string;

    if (!file || !documentRequestId) {
      return NextResponse.json(
        { error: 'File and document request ID are required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, WEBP' },
        { status: 400 }
      );
    }

    // Verify document request exists and is active
    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id: documentRequestId }
    });

    if (!documentRequest || !documentRequest.isActive) {
      return NextResponse.json(
        { error: 'Document request not found or inactive' },
        { status: 404 }
      );
    }

    // Check if user has already uploaded a file for this request
    const existingUpload = await prisma.documentUpload.findFirst({
      where: {
        documentRequestId,
        uploadedBy: session.user.id
      }
    });

    if (existingUpload) {
      return NextResponse.json(
        { error: 'You have already uploaded a file for this request' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = join(uploadsDir, uniqueFileName);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save upload record to database
    const documentUpload = await prisma.documentUpload.create({
      data: {
        fileName: uniqueFileName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        filePath: `/uploads/documents/${uniqueFileName}`,
        uploadedBy: session.user.id,
        documentRequestId
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        },
        documentRequest: {
          select: { id: true, title: true }
        }
      }
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      upload: documentUpload
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

