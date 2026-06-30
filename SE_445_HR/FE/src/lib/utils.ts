export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateInput(dateStr: string | null): string {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

export function getGioiTinhLabel(gioi_tinh: string | null): string {
  const map: Record<string, string> = {
    nam: 'Nam',
    nu: 'Nữ',
    khac: 'Khác',
  };
  return gioi_tinh ? map[gioi_tinh] || gioi_tinh : '—';
}

export function getTrangThaiHopDongLabel(status: string): string {
  const map: Record<string, string> = {
    thu_viec: 'Thử việc',
    chinh_thuc: 'Chính thức',
    het_han: 'Hết hạn',
    da_nghi: 'Đã nghỉ',
  };
  return map[status] || status;
}

export function getTrangThaiLamViecLabel(status: string): string {
  const map: Record<string, string> = {
    dang_lam: 'Đang làm',
    nghi_phep: 'Nghỉ phép',
    nghi_viec: 'Nghỉ việc',
  };
  return map[status] || status;
}

export function getTrangThaiChamCongLabel(status: string): string {
  const map: Record<string, string> = {
    chua_duyet: 'Chưa duyệt',
    da_duyet: 'Đã duyệt',
    tu_choi: 'Từ chối',
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-danger',
    dang_lam: 'badge-success',
    nghi_phep: 'badge-warning',
    nghi_viec: 'badge-danger',
    thu_viec: 'badge-info',
    chinh_thuc: 'badge-success',
    het_han: 'badge-warning',
    da_nghi: 'badge-danger',
    chua_duyet: 'badge-warning',
    da_duyet: 'badge-success',
    tu_choi: 'badge-danger',
  };
  return colorMap[status] || 'badge-default';
}
