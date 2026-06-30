const BFF_BASE = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BFF_BASE}${path}`, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.message || `Error ${res.status}`);
  }
  return json as T;
}

export const overviewApi = {
  get: () =>
    request<{ success: true; data: import("@/types").OverviewData }>("/bff/overview"),
};

export const workforceApi = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return request<import("@/types").WorkforceResponse & { success: true }>(
      `/bff/workforce${qs ? `?${qs}` : ""}`
    );
  },
};

export const payrollApi = {
  // ✅ Danh sách kỳ lương — gọi đúng /bff/payroll
  list: () =>
    request<{ success: true; data: import("@/types").KyLuong[] }>("/bff/payroll"),

  // ✅ Chi tiết kỳ lương — đúng type PayrollDetailDTO
  detail: (id: string) =>
    request<{ success: true; data: import("@/types").PayrollDetailDTO }>(`/bff/payroll/${id}`),
};

export const reportsApi = {
  cross: (kyLuongId?: string) => {
    const qs = kyLuongId ? `?ky_luong_id=${kyLuongId}` : "";
    return request<{ success: true; data: import("@/types").CrossReport[] }>(
      `/bff/reports/cross${qs}`
    );
  },
  // ✅ Giữ nguyên — ReportsPage dùng endpoint này để lấy dropdown
  kyLuongList: () =>
    request<{ success: true; data: import("@/types").KyLuong[] }>("/bff/reports/ky-luong"),
};

export const bffApi = {
  overview:       () => overviewApi.get(),
  workforce:      (params?: Record<string, string | number>) => workforceApi.list(params),

  // ✅ PayrollListPage dùng — gọi /bff/payroll (không phải reports)
  listKyLuong:    () => payrollApi.list(),

  // ✅ PayrollDetailPage dùng — gọi /bff/payroll/:id → trả PayrollDetailDTO
  payrollDetail:  (id: string) => payrollApi.detail(id),
  getPayrollDetail: (id: string) => payrollApi.detail(id),

  // ✅ ReportsPage dùng — giữ nguyên /bff/reports/ky-luong
  listKyLuongForReports: () => reportsApi.kyLuongList(),
  crossReport:    (kyLuongId?: string) => reportsApi.cross(kyLuongId),
  getCrossReport: (kyLuongId?: string) => reportsApi.cross(kyLuongId),
};

export const BFF_WS_URL = BFF_BASE.replace(/^http/, "ws") + "/ws";