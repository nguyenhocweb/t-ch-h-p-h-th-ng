"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface KyLuong {
  id: number;
  tenKy: string;
  thang: number;
  nam: number;
  ngayTraLuong: string;
  soNgayCongChuan: number;
  trangThai: string;
}

interface FormData {
  tenKy: string;
  thang: number;
  nam: number;
  ngayTraLuong: string;
  soNgayCongChuan: number;
}

export default function KyLuongPage() {
  const { user } = useAuth();
  const [kyLuongs, setKyLuongs] = useState<KyLuong[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    tenKy: '',
    thang: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
    ngayTraLuong: '',
    soNgayCongChuan: 20
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('http://localhost:5000/api/ky-luong');
        const json = await res.json();
        if (!cancelled && json.success) setKyLuongs(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const fetchKyLuongs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/ky-luong');
      const json = await res.json();
      if (json.success) setKyLuongs(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/ky-luong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchKyLuongs();
        setFormData({
          tenKy: '',
          thang: new Date().getMonth() + 1,
          nam: new Date().getFullYear(),
          ngayTraLuong: '',
          soNgayCongChuan: 20
        });
      } else {
        alert('Có lỗi xảy ra');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-700';
      case 'OPEN': return 'bg-blue-100 text-blue-700';
      case 'LOCKED': return 'bg-amber-100 text-amber-700';
      case 'PAID': return 'bg-emerald-100 text-emerald-700';
      case 'CLOSED': return 'bg-zinc-100 text-zinc-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Bản nháp';
      case 'OPEN': return 'Đang mở';
      case 'LOCKED': return 'Đã khóa';
      case 'PAID': return 'Đã thanh toán';
      case 'CLOSED': return 'Đã đóng';
      default: return status;
    }
  };

  if (user?.role === 'EMPLOYEE') {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Truy cập bị từ chối</h2>
          <p className="text-slate-500">Bạn không có quyền quản lý kỳ lương.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Kỳ Lương</h1>
          <p className="text-slate-500 mt-1">Danh sách các đợt trả lương theo tháng.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Tạo kỳ lương mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Tên kỳ lương</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Tháng/Năm</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Ngày trả (Dự kiến)</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Công chuẩn</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kyLuongs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Chưa có đợt lương nào được tạo.
                  </td>
                </tr>
              ) : (
                kyLuongs.map((kl) => (
                  <tr key={kl.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{kl.tenKy}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      Tháng {kl.thang}/{kl.nam}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(kl.ngayTraLuong).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {kl.soNgayCongChuan} ngày
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(kl.trangThai)}`}>
                        {getStatusText(kl.trangThai)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/payroll/${kl.id}`}
                        className="inline-flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-sm gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Bảng lương
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 px-6 py-4 text-white">
              <h2 className="text-xl font-bold">Tạo Kỳ Lương Mới</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên kỳ lương</label>
                  <input
                    type="text" required
                    value={formData.tenKy}
                    onChange={e => setFormData({ ...formData, tenKy: e.target.value })}
                    placeholder="VD: Lương Tháng 6/2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tháng</label>
                    <input
                      type="number" required min="1" max="12"
                      value={formData.thang}
                      onChange={e => setFormData({ ...formData, thang: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Năm</label>
                    <input
                      type="number" required
                      value={formData.nam}
                      onChange={e => setFormData({ ...formData, nam: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày trả lương dự kiến</label>
                  <input
                    type="date" required
                    value={formData.ngayTraLuong}
                    onChange={e => setFormData({ ...formData, ngayTraLuong: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số ngày công chuẩn</label>
                  <input
                    type="number" required step="0.5"
                    value={formData.soNgayCongChuan}
                    onChange={e => setFormData({ ...formData, soNgayCongChuan: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
