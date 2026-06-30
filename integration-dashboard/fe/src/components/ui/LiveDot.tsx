import clsx from 'clsx';
import type { WSStatus } from '@/hooks/useSocket';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<WSStatus, {
  dot: string;
  ping: string;
  badge: string;
  label: string;
  showPing: boolean;
}> = {
  connected: {
    dot:      'bg-emerald-500',
    ping:     'bg-emerald-400',
    badge:    'bg-emerald-50 text-emerald-700 ring-emerald-200',
    label:    'Live',
    showPing: true,
  },
  connecting: {
    dot:      'bg-amber-400',
    ping:     'bg-amber-300',
    badge:    'bg-amber-50 text-amber-700 ring-amber-200',
    label:    'Đang kết nối',
    showPing: false,
  },
  disconnected: {
    dot:      'bg-slate-400',
    ping:     '',
    badge:    'bg-slate-100 text-slate-500 ring-slate-200',
    label:    'Offline',
    showPing: false,
  },
  error: {
    dot:      'bg-red-500',
    ping:     'bg-red-400',
    badge:    'bg-red-50 text-red-600 ring-red-200',
    label:    'Lỗi kết nối',
    showPing: false,
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface LiveDotProps {
  status: WSStatus;
  /** 'dot' = just the pulsing dot, 'badge' = pill with label (default) */
  variant?: 'dot' | 'badge';
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiveDot({ status, variant = 'badge', className }: LiveDotProps) {
  const cfg = STATUS_CONFIG[status];

  // Just the dot
  if (variant === 'dot') {
    return (
      <span className={clsx('relative flex h-2.5 w-2.5', className)}>
        {cfg.showPing && (
          <span
            className={clsx(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
              cfg.ping,
            )}
          />
        )}
        <span className={clsx('relative inline-flex h-2.5 w-2.5 rounded-full', cfg.dot)} />
      </span>
    );
  }

  // Badge pill
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        cfg.badge,
        className,
      )}
    >
      {/* Dot with optional ping */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        {cfg.showPing && (
          <span
            className={clsx(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
              cfg.ping,
            )}
          />
        )}
        {/* Connecting: spinning arc instead of solid dot */}
        {status === 'connecting' ? (
          <span className="relative inline-flex h-2 w-2">
            <svg
              className="absolute inset-0 h-2 w-2 animate-spin"
              viewBox="0 0 8 8"
              fill="none"
            >
              <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
              <path d="M4 1a3 3 0 013 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        ) : (
          <span className={clsx('relative inline-flex h-2 w-2 rounded-full', cfg.dot)} />
        )}
      </span>

      {cfg.label}
    </span>
  );
}