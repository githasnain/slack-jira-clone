'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import MainLayout from '../../components/MainLayout';

interface DocumentRequest {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  dueDate: string | null;
  createdAt: string;
  uploads: DocumentUpload[];
}

interface DocumentUpload {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setIsLoading(false);
      loadDocumentRequests();
    };

    checkAuth();
  }, [session, status, router]);

  const loadDocumentRequests = async () => {
    try {
      const response = await fetch('/api/document-requests');
      if (response.ok) {
        const data = await response.json();
        setDocumentRequests(data);
      } else {
        console.error('Failed to load document requests');
      }
    } catch (error) {
      console.error('Error loading document requests:', error);
    }
  };

  const handleFileUpload = async (requestId: string, file: File) => {
    setUploading(requestId);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentRequestId', requestId);

      const response = await fetch('/api/document-uploads', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully!');
        loadDocumentRequests();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (requestId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          handleFileUpload(requestId, file);
        }
      };
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📈';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  };

  const hasUserUploaded = (request: DocumentRequest) => {
    return request.uploads.some(upload => upload.uploader.id === session?.user?.id);
  };

  const getUserUpload = (request: DocumentRequest) => {
    return request.uploads.find(upload => upload.uploader.id === session?.user?.id);
  };

  if (isLoading || status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Document Requests
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Upload documents as requested by the admin
            </p>
          </div>
        </div>

        {/* Document Requests List */}
        <div className="space-y-6">
          {documentRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No document requests</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no active document requests at the moment.</p>
            </div>
          ) : (
            documentRequests.map((request) => {
              const userHasUploaded = hasUserUploaded(request);
              const userUpload = getUserUpload(request);
              
              return (
                <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {request.title}
                      </h3>
                      {request.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {request.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        request.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {request.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {userHasUploaded && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Uploaded
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {request.dueDate && (
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {new Date(request.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Uploads:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {request.uploads.length} files
                      </span>
                    </div>
                  </div>

                  {/* Upload Section */}
                  {request.isActive && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      {userHasUploaded ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-green-600 dark:text-green-400">✅</span>
                              <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                  You have uploaded a file
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  {userUpload?.originalName} ({formatFileSize(userUpload?.fileSize || 0)})
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a
                                href={userUpload?.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </a>
                              <a
                                href={userUpload?.filePath}
                                download={userUpload?.originalName}
                                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                Upload your document
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Allowed file types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, WEBP (Max 10MB)
                              </p>
                            </div>
                            <button
                              onClick={() => handleFileSelect(request.id)}
                              disabled={uploading === request.id}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                              {uploading === request.id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  Upload File
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other Users' Uploads (if any) */}
                  {request.uploads.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        All Uploaded Files ({request.uploads.length})
                      </h4>
                      <div className="space-y-2">
                        {request.uploads.map((upload) => (
                          <div key={upload.id} className={`flex items-center justify-between p-3 rounded-lg ${
                            upload.uploader.id === session.user?.id 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                              : 'bg-gray-50 dark:bg-gray-700'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{getFileIcon(upload.mimeType)}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {upload.originalName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(upload.fileSize)} • {upload.uploader.name} • {new Date(upload.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a
                                href={upload.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </a>
                              <a
                                href={upload.filePath}
                                download={upload.originalName}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
          className="hidden"
        />
      </div>
    </MainLayout>
  );
}


