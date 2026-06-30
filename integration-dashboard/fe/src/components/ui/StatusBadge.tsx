import clsx from 'clsx';
import {
  TRANG_THAI_KY_LUONG,
  TRANG_THAI_LAM_VIEC,
  TRANG_THAI_HOP_DONG,
  TRANG_THAI_BANG_LUONG,
} from '@/utils/format';

// ─── Config maps ──────────────────────────────────────────────────────────────

const KY_LUONG_STYLE: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  DRAFT:  { bg: 'bg-slate-100',   text: 'text-slate-600',   ring: 'ring-slate-200',   dot: 'bg-slate-400'   },
  OPEN:   { bg: 'bg-blue-50',     text: 'text-blue-700',    ring: 'ring-blue-200',    dot: 'bg-blue-500'    },
  LOCKED: { bg: 'bg-amber-50',    text: 'text-amber-700',   ring: 'ring-amber-200',   dot: 'bg-amber-500'   },
  PAID:   { bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  CLOSED: { bg: 'bg-zinc-100',    text: 'text-zinc-500',    ring: 'ring-zinc-200',    dot: 'bg-zinc-400'    },
};

const LAM_VIEC_STYLE: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  dang_lam:  { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  nghi_phep: { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200',   dot: 'bg-amber-400'   },
  nghi_viec: { bg: 'bg-red-50',     text: 'text-red-600',     ring: 'ring-red-200',     dot: 'bg-red-500'     },
};

const HOP_DONG_STYLE: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  thu_viec:   { bg: 'bg-sky-50',     text: 'text-sky-700',     ring: 'ring-sky-200',     dot: 'bg-sky-500'     },
  chinh_thuc: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  ring: 'ring-indigo-200',  dot: 'bg-indigo-500'  },
  het_han:    { bg: 'bg-orange-50',  text: 'text-orange-700',  ring: 'ring-orange-200',  dot: 'bg-orange-500'  },
  da_nghi:    { bg: 'bg-slate-100',  text: 'text-slate-500',   ring: 'ring-slate-200',   dot: 'bg-slate-400'   },
};

const BANG_LUONG_STYLE: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  DRAFT:      { bg: 'bg-slate-100',   text: 'text-slate-600',   ring: 'ring-slate-200',   dot: 'bg-slate-400'   },
  CALCULATED: { bg: 'bg-blue-50',     text: 'text-blue-700',    ring: 'ring-blue-200',    dot: 'bg-blue-500'    },
  APPROVED:   { bg: 'bg-violet-50',   text: 'text-violet-700',  ring: 'ring-violet-200',  dot: 'bg-violet-500'  },
  PAID:       { bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  CANCEL:     { bg: 'bg-red-50',      text: 'text-red-600',     ring: 'ring-red-200',     dot: 'bg-red-500'     },
};

const FALLBACK = { bg: 'bg-slate-100', text: 'text-slate-500', ring: 'ring-slate-200', dot: 'bg-slate-400' };

// ─── Base badge ───────────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  style: { bg: string; text: string; ring: string; dot: string };
  showDot?: boolean;
  size?: 'sm' | 'md';
}

function Badge({ label, style, showDot = true, size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold ring-1',
        style.bg,
        style.text,
        style.ring,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      )}
    >
      {showDot && (
        <span className={clsx('h-1.5 w-1.5 flex-shrink-0 rounded-full', style.dot)} />
      )}
      {label}
    </span>
  );
}

// ─── Exported badge components ────────────────────────────────────────────────

export default function StatusBadge({
  label,
  color,
  dot,
}: {
  label: string;
  color: string;
  dot?: boolean;
}) {
  // Legacy compat — accepts raw Tailwind color string
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-current/10',
        color,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-70" />}
      {label}
    </span>
  );
}

export function KyLuongStatusBadge({ status, size }: { status: string; size?: 'sm' | 'md' }) {
  const labelMap = TRANG_THAI_KY_LUONG[status];
  const style = KY_LUONG_STYLE[status] ?? FALLBACK;
  return (
    <Badge
      label={labelMap?.label ?? status}
      style={style}
      size={size}
    />
  );
}

export function LamViecBadge({ status, size }: { status: string; size?: 'sm' | 'md' }) {
  const labelMap = TRANG_THAI_LAM_VIEC[status];
  const style = LAM_VIEC_STYLE[status] ?? FALLBACK;
  return (
    <Badge
      label={labelMap?.label ?? status}
      style={style}
      size={size}
    />
  );
}

export function HopDongBadge({ status, size }: { status: string; size?: 'sm' | 'md' }) {
  const labelMap = TRANG_THAI_HOP_DONG[status];
  const style = HOP_DONG_STYLE[status] ?? FALLBACK;
  return (
    <Badge
      label={labelMap?.label ?? status}
      style={style}
      size={size}
    />
  );
}

export function BangLuongBadge({ status, size }: { status: string; size?: 'sm' | 'md' }) {
  const labelMap = TRANG_THAI_BANG_LUONG[status];
  const style = BANG_LUONG_STYLE[status] ?? FALLBACK;
  return (
    <Badge
      label={labelMap?.label ?? status}
      style={style}
      size={size}
    />
  );
}

// ─── Employment status convenience export ─────────────────────────────────────
export { LamViecBadge as EmploymentStatusBadge };