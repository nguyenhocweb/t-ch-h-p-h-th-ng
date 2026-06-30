const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

// --- Phòng Ban ---
export const phongBanApi = {
  list: (params?: string) => api.get(`/hr/phong-ban${params ? `?${params}` : ''}`),
  all: () => api.get('/hr/phong-ban/all'),
  get: (id: number) => api.get(`/hr/phong-ban/${id}`),
  create: (data: unknown) => api.post('/hr/phong-ban', data),
  update: (id: number, data: unknown) => api.put(`/hr/phong-ban/${id}`, data),
  delete: (id: number) => api.delete(`/hr/phong-ban/${id}`),
};

// --- Chức Vụ ---
export const chucVuApi = {
  list: (params?: string) => api.get(`/hr/chuc-vu${params ? `?${params}` : ''}`),
  all: (phongBanId?: number) => api.get(`/hr/chuc-vu/all${phongBanId ? `?phong_ban_id=${phongBanId}` : ''}`),
  get: (id: number) => api.get(`/hr/chuc-vu/${id}`),
  create: (data: unknown) => api.post('/hr/chuc-vu', data),
  update: (id: number, data: unknown) => api.put(`/hr/chuc-vu/${id}`, data),
  delete: (id: number) => api.delete(`/hr/chuc-vu/${id}`),
};

// --- Nhân Viên ---
export const nhanVienApi = {
  list: (params?: string) => api.get(`/hr/nhan-vien${params ? `?${params}` : ''}`),
  get: (id: number) => api.get(`/hr/nhan-vien/${id}`),
  create: (data: unknown) => api.post('/hr/nhan-vien', data),
  update: (id: number, data: unknown) => api.put(`/hr/nhan-vien/${id}`, data),
  delete: (id: number) => api.delete(`/hr/nhan-vien/${id}`),
};

// --- Chấm Công ---
export const chamCongApi = {
  list: (params?: string) => api.get(`/hr/cham-cong${params ? `?${params}` : ''}`),
  get: (id: number) => api.get(`/hr/cham-cong/${id}`),
  create: (data: unknown) => api.post('/hr/cham-cong', data),
  update: (id: number, data: unknown) => api.put(`/hr/cham-cong/${id}`, data),
  delete: (id: number) => api.delete(`/hr/cham-cong/${id}`),
};

// --- Statistics ---
export const statisticsApi = {
  overview: () => api.get('/hr/statistics/overview'),
  byDepartment: () => api.get('/hr/statistics/by-department'),
};
