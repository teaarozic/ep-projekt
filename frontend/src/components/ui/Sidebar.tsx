'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  UsersRound,
  LogOut,
  LucideIcon,
  Menu,
  X,
  Network,
  UserRound,
  BookCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import {
  clearHistoryAndNavigate,
  clearAuthData,
} from '@/utils/navigationUtils';
import { getRole, Role } from '@/utils/auth';
import { useAuth } from '@/context/AuthContext';
import { getDisplayName, getInitials } from '@/utils/userDisplay';
import { useSidebar } from '@/context/SidebarContext';

export default function Sidebar() {
  const [role, setRole] = useState<Role | null>(null);
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    setRole(getRole());
  }, []);

  const handleLogout = () => {
    clearAuthData();
    toast.success('You have been logged out.');
    clearHistoryAndNavigate('/login');
  };

  const toggleSidebar = toggle;

  const linksByRole: Record<
    Role,
    { href: string; icon: LucideIcon; label: string }[]
  > = {
    USER: [
      { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
      { href: '/projects', icon: Network, label: 'Projects' },
      { href: '/tasks', icon: BookCheck, label: 'Tasks' },
    ],
    ADMIN: [
      { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
      { href: '/clients', icon: UsersRound, label: 'Clients' },
      { href: '/projects', icon: Network, label: 'Projects' },
      { href: '/tasks', icon: BookCheck, label: 'Tasks' },
      { href: '/users', icon: UserRound, label: 'Users' },
    ],
    SA: [
      { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
      { href: '/clients', icon: UsersRound, label: 'Clients' },
      { href: '/projects', icon: Network, label: 'Projects' },
      { href: '/tasks', icon: BookCheck, label: 'Tasks' },
      { href: '/users', icon: UserRound, label: 'Users' },
    ],
  };

  const roleLinks = role ? linksByRole[role] : [];
  const { user } = useAuth();
  useEffect(() => {
    const handleAuthUpdate = () => {
      setRole(getRole());
    };
    window.addEventListener('auth-updated', handleAuthUpdate);
    return () => window.removeEventListener('auth-updated', handleAuthUpdate);
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 flex h-screen flex-col rounded-r-2xl bg-black text-white shadow-lg transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top section */}
      <div
        className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
          collapsed ? 'h-20' : 'h-28'
        }`}
      >
        {!collapsed ? (
          <>
            <img
              src="/logo-taskflow.png"
              alt="TaskFlow Logo"
              className="mt-3 h-20 w-14 object-contain"
            />
            <button
              onClick={toggleSidebar}
              className="text-white-500 absolute right-4 top-11"
            >
              <X size={20} />
            </button>
            {/* jedna jedina linija */}
            <div className="mx-4 mt-3 w-full border-b border-gray-800"></div>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="text-white-500 flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-900"
          >
            <Menu size={22} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 transition-all duration-300 ${
          collapsed
            ? 'mt-3 flex flex-col items-center space-y-3'
            : 'mt-4 space-y-1'
        }`}
      >
        {/* === Regular links === */}
        {roleLinks
          .filter((link) => !link.href.startsWith('/ai'))
          .map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center ${
                  collapsed
                    ? 'mx-auto justify-center px-0'
                    : 'mx-3 justify-start pl-6'
                } gap-4 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? collapsed
                      ? 'text-lime-500'
                      : 'bg-lime-500 text-white'
                    : 'text-white hover:bg-gray-900'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive
                      ? 'text-white-500'
                      : collapsed
                        ? 'text-white'
                        : 'text-lime-500'
                  }`}
                />
                {!collapsed && (
                  <span className="tracking-wide text-white">{link.label}</span>
                )}
              </Link>
            );
          })}

        {/* === Divider before AI Section === */}
        <div className="mx-4 my-3 border-t border-gray-800"></div>

        {/* === AI Dashboard Link === */}
        <div
          className={`flex-1 transition-all duration-300 ${
            collapsed
              ? 'mt-3 flex flex-col items-center space-y-3'
              : 'mt-4 space-y-1'
          }`}
        >
          <Link
            href="/ai/dashboard"
            className={`flex items-center ${
              collapsed
                ? 'mx-auto justify-center px-0'
                : 'mx-3 justify-start pl-6'
            } gap-4 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
              pathname.startsWith('/ai/dashboard')
                ? collapsed
                  ? 'text-lime-400'
                  : 'bg-lime-500 text-white'
                : 'text-white hover:bg-gray-900'
            }`}
          >
            {/* === Text “AI” acting as icon === */}
            <span
              className={`flex h-6 w-6 items-center justify-center font-bold ${
                pathname.startsWith('/ai/dashboard')
                  ? collapsed
                    ? 'text-lime-400 drop-shadow-[0_0_4px_#a3e635]'
                    : 'text-white'
                  : collapsed
                    ? 'text-white'
                    : 'text-lime-500'
              }`}
            >
              AI
            </span>

            {!collapsed && (
              <span className="tracking-wide text-white">AI Dashboard</span>
            )}
          </Link>
        </div>
      </nav>

      {/* === User info === */}
      <div
        className={`mx-4 mb-4 mt-auto overflow-hidden rounded-2xl bg-lime-500 transition-all duration-300 ${
          collapsed
            ? 'mx-auto flex h-10 w-10 items-center justify-center'
            : 'flex items-center p-3'
        }`}
      >
        {collapsed ? (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white font-semibold text-lime-600">
            {getInitials(user ?? { name: '', email: '' })}
          </div>
        ) : (
          <>
            {/* Left circle with initials */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white font-semibold text-lime-600">
              {getInitials(user ?? { name: '', email: '' })}
            </div>

            {/* Right text info */}
            <div className="ml-3 flex flex-col leading-tight text-white">
              <span className="max-w-[180px] truncate text-sm font-semibold">
                {getDisplayName(user ?? { name: '', email: '' })}
              </span>
              <span className="text-xs text-white/80">
                {role === 'SA'
                  ? 'Super Admin'
                  : role === 'ADMIN'
                    ? 'Admin'
                    : 'User'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={`mb-3 flex items-center justify-center gap-2 text-sm text-red-400 transition hover:text-red-300 ${
          collapsed ? '' : 'px-3'
        }`}
      >
        <LogOut className="h-4 w-4" />
        {!collapsed && 'Logout'}
      </button>
    </aside>
  );
}
