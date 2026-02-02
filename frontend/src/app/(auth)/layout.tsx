import PublicGuard from '@/components/features/PublicGuardInner';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicGuard>
      <div className="flex min-h-screen items-center justify-center bg-black">
        {children}
      </div>
    </PublicGuard>
  );
}
