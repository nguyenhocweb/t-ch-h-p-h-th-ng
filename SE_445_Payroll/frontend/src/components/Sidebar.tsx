"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  FileSpreadsheet,
  Settings,
  LogOut,
} from 'lucide-react';

const allNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'EMPLOYEE', 'HR'] },
  { name: 'Tính lương', href: '/payroll', icon: FileSpreadsheet, roles: ['ADMIN', 'EMPLOYEE', 'HR'] },
  { name: 'Cài đặt', href: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  
  const navItems = allNavItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 transition-all duration-300 shadow-xl z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-wide">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-lg leading-none">P</span>
          </div>
          Payroll Pro
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white group"
            >
              <Icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="px-3 py-3 mb-2 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-400">Đăng nhập với tư cách</p>
          <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
          <p className="text-xs text-indigo-400 font-medium">{user?.role}</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400 group"
        >
          <LogOut className="w-5 h-5 group-hover:text-rose-400 transition-colors" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
