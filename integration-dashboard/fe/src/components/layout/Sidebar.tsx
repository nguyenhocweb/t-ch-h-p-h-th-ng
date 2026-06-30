'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard, Users, Wallet, FileBarChart2, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/overview', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/workforce', label: 'Nhân sự', icon: Users },
  { href: '/payroll', label: 'Tiền lương', icon: Wallet },
  { href: '/reports', label: 'Báo cáo', icon: FileBarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-900 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Integration</p>
            <p className="text-slate-400 text-xs mt-0.5">Dashboard</p>
          </div>
        </div>
      </div>

      {/* System labels */}
      <div className="px-5 py-3 flex gap-2">
        <span className="text-xs px-2 py-0.5 rounded bg-teal-900 text-teal-300 font-medium">HR</span>
        <span className="text-xs px-2 py-0.5 rounded bg-purple-900 text-purple-300 font-medium">Payroll</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.email}</p>
            <p className="text-slate-400 text-xs">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}