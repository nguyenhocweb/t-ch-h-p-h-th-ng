export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function formatKyLuongLabel(thang: number, nam: number): string {
  return `Thang ${String(thang).padStart(2, '0')}/${nam}`;
}

export const TRANG_THAI_LAM_VIEC: Record<string, { label: string; color: string }> = {
  dang_lam: { label: 'Dang lam', color: 'bg-emerald-100 text-emerald-800' },
  nghi_phep: { label: 'Nghi phep', color: 'bg-amber-100 text-amber-800' },
  nghi_viec: { label: 'Nghi viec', color: 'bg-red-100 text-red-800' },
};

export const TRANG_THAI_HOP_DONG: Record<string, { label: string; color: string }> = {
  thu_viec: { label: 'Thu viec', color: 'bg-sky-100 text-sky-800' },
  chinh_thuc: { label: 'Chinh thuc', color: 'bg-emerald-100 text-emerald-800' },
  het_han: { label: 'Het han', color: 'bg-amber-100 text-amber-800' },
  da_nghi: { label: 'Da nghi', color: 'bg-red-100 text-red-800' },
};

export const TRANG_THAI_BANG_LUONG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Ban nhap', color: 'bg-slate-100 text-slate-700' },
  CALCULATED: { label: 'Da tinh', color: 'bg-blue-100 text-blue-800' },
  APPROVED: { label: 'Da duyet', color: 'bg-indigo-100 text-indigo-800' },
  PAID: { label: 'Da tra', color: 'bg-emerald-100 text-emerald-800' },
  CANCEL: { label: 'Huy', color: 'bg-red-100 text-red-800' },
};

export const TRANG_THAI_KY_LUONG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Ban nhap', color: 'bg-slate-100 text-slate-700' },
  OPEN: { label: 'Dang mo', color: 'bg-blue-100 text-blue-800' },
  LOCKED: { label: 'Da khoa', color: 'bg-amber-100 text-amber-800' },
  PAID: { label: 'Da tra', color: 'bg-emerald-100 text-emerald-800' },
  CLOSED: { label: 'Da dong', color: 'bg-zinc-100 text-zinc-700' },
};
