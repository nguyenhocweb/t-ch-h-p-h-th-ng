'use client';

import { RefreshCw } from 'lucide-react';
import LiveDot from '@/components/ui/LiveDot';
import type { WSStatus } from '@/hooks/useSocket';

interface HeaderProps {
  title: string;
  subtitle?: string;
  wsStatus: WSStatus;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, wsStatus, lastUpdated, onRefresh, actions }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span className="text-xs text-slate-400">
            Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
          </span>
        )}
        <LiveDot status={wsStatus} />
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        {actions}
      </div>
    </header>
  );
}