import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Task Flow',
  description: 'Project & Task Manager',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full text-gray-900">
        {/* AuthProvider daje user info cijeloj aplikaciji */}
        <AuthProvider>
          {children}

          {/* Global Toaster za poruke */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#333',
                border: '1px solid #e5e7eb',
                padding: '12px 16px',
                borderRadius: '8px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
