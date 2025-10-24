'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, memo } from 'react';
import ThemeToggle from './ThemeToggle';
import LoadingSpinner from './LoadingSpinner';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { SessionHandler } from './SessionHandler';
import SessionInfo from './SessionInfo';
import AdminUserSwitcher from './AdminUserSwitcher';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = memo(function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Helper function to determine if a navigation item is active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(path);
  };

  // Optimized sidebar state management - combined effects
  useEffect(() => {
    // Load saved state
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true');
    }

    // Handle resize with debouncing for better performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 1024) {
          setSidebarOpen(true);
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Save sidebar state only when it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  // Optimized session handling
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Reduced timeout for better UX
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
        router.push('/login');
      }, 5000); // Reduced to 5 seconds

      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (status === 'loading' && !loadingTimeout) {
    return <LoadingSpinner />;
  }

  if (!session || loadingTimeout) {
    return <LoadingSpinner />;
  }

  const isAdmin = session.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PerformanceOptimizer />
      <SessionHandler />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center ml-4">
                <div className="flex-shrink-0">
                  <img 
                    src="/vertexai-logo.svg" 
                    alt="VertexAi Tec Logo" 
                    className="h-8 w-8"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    VertexAi Tec
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <SessionInfo />
              <ThemeToggle />
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Welcome, {session.user?.name || session.user?.email}
                  </div>
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <div className="font-medium">{session.user?.name || 'User'}</div>
                      <div className="text-gray-500 dark:text-gray-400">{session.user?.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 lg:block lg:static lg:inset-0 lg:z-auto lg:translate-x-0 transition-transform duration-300 ease-in-out min-h-screen`}>
          {/* Mobile close button */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              <a
                href="/dashboard"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/dashboard')
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className={`mr-3 h-5 w-5 ${
                  isActive('/dashboard') ? 'text-gray-500' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Dashboard
              </a>

              <a
                href="/projects"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/projects')
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className={`mr-3 h-5 w-5 ${
                  isActive('/projects') ? 'text-gray-500' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Projects
              </a>

              <a
                href="/tickets"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/tickets')
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className={`mr-3 h-5 w-5 ${
                  isActive('/tickets') ? 'text-gray-500' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tickets
              </a>

              <a
                href="/teams"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/teams')
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className={`mr-3 h-5 w-5 ${
                  isActive('/teams') ? 'text-gray-500' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Teams
              </a>

              <a
                href="/messages"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/messages')
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className={`mr-3 h-5 w-5 ${
                  isActive('/messages') ? 'text-gray-500' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messages
              </a>

              <a
                href="/analytics"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/analytics')
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className={`mr-3 h-5 w-5 ${
                  isActive('/analytics') ? 'text-gray-500' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </a>
              <a
                href="/documents"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/documents')
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className={`mr-3 h-5 w-5 ${
                  isActive('/documents') ? 'text-gray-500' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </a>

              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                  <div className="px-2 py-1">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Admin
                    </h3>
                  </div>
                  <a
                    href="/admin"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/admin')
                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Admin Dashboard
                  </a>
                  <a
                    href="/admin/users"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/admin/users')
                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Manage Users
                  </a>
                  <a
                    href="/admin/projects"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/admin/projects')
                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Admin Projects
                  </a>
                  <a
                    href="/admin/system-logs"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/admin/system-logs')
                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    System Logs
                  </a>
                  <a
                    href="/admin/documents"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/admin/documents')
                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Document Requests
                  </a>
                  <a
                    href="/admin/channels"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/admin/channels')
                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Channel Management
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          {children}
        </div>
      </div>
    </div>
  );
});

export default MainLayout;
