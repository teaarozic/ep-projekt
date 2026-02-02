'use client';

import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/ui/Sidebar';
import AuthGuard from '@/components/features/AuthGuard';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50 transition-all duration-300">
      {/* Sidebar */}
      <Sidebar />

      {/* Glavni sadržaj */}
      <main
        className={`flex-1 overflow-visible p-8 transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div
          className={`mx-auto transition-all duration-300 ${
            collapsed ? 'w-full max-w-[95vw]' : 'w-full max-w-[80vw]'
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </AuthGuard>
  );
}
