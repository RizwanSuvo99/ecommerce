'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Admin Layout
// ──────────────────────────────────────────────────────────

/**
 * Admin layout with collapsible sidebar and top bar.
 *
 * Only accessible to users with ADMIN or SUPER_ADMIN roles.
 * Redirects unauthorized users to the login page.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleDesktopSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admin users
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleDesktopSidebar}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Main content area */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64',
        )}
      >
        {/* Top bar */}
        <AdminTopbar
          sidebarCollapsed={sidebarCollapsed}
          onMenuToggle={toggleMobileSidebar}
          onDesktopToggle={toggleDesktopSidebar}
        />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
