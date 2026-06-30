import { type ReactNode } from 'react';
import clsx from 'clsx';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  sub?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'indigo' | 'violet';
  trend?: { value: number; label?: string }; // positive = up, negative = down
  loading?: boolean;
}

const COLOR_MAP: Record<
  NonNullable<KpiCardProps['color']>,
  { icon: string; ring: string; trend: string }
> = {
  blue:    { icon: 'bg-blue-50 text-blue-600',    ring: 'ring-blue-100',    trend: 'text-blue-500'    },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-100', trend: 'text-emerald-600' },
  amber:   { icon: 'bg-amber-50 text-amber-600',   ring: 'ring-amber-100',   trend: 'text-amber-600'   },
  red:     { icon: 'bg-red-50 text-red-500',       ring: 'ring-red-100',     trend: 'text-red-500'     },
  indigo:  { icon: 'bg-indigo-50 text-indigo-600', ring: 'ring-indigo-100',  trend: 'text-indigo-600'  },
  violet:  { icon: 'bg-violet-50 text-violet-600', ring: 'ring-violet-100',  trend: 'text-violet-600'  },
};

function TrendArrow({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <svg
      viewBox="0 0 10 10"
      className={clsx('h-3 w-3', up ? 'text-emerald-500' : 'text-red-400')}
      fill="currentColor"
    >
      {up ? (
        <path d="M5 2l4 6H1z" />
      ) : (
        <path d="M5 8L1 2h8z" />
      )}
    </svg>
  );
}

export default function KpiCard({
  label,
  value,
  icon,
  sub,
  color = 'blue',
  trend,
  loading,
}: KpiCardProps) {
  const c = COLOR_MAP[color];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Subtle top accent line */}
      <div className={clsx('absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 transition-opacity group-hover:opacity-100', c.icon.split(' ')[0].replace('bg-', 'bg-').replace('50', '400'))} />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={clsx(
            'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ring-4 transition-transform group-hover:scale-105',
            c.icon,
            c.ring,
          )}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>

          {loading ? (
            <div className="mt-1.5 space-y-1.5">
              <div className="h-7 w-24 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
            </div>
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-slate-900">
                {value}
              </p>

              <div className="mt-1.5 flex items-center gap-2">
                {sub && (
                  <p className="truncate text-xs text-slate-400">{sub}</p>
                )}
                {trend && (
                  <span className="ml-auto inline-flex items-center gap-0.5 text-xs font-medium">
                    <TrendArrow value={trend.value} />
                    <span className={trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                      {Math.abs(trend.value)}%
                    </span>
                    {trend.label && (
                      <span className="text-slate-400">{trend.label}</span>
                    )}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}