"use client";

// cspell:disable
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Plus, Edit2, Trash2, Calculator,
  CheckCircle2, FileSpreadsheet, Lock, Upload, Download
} from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';

interface KyLuong {
  id: string;
  tenKy: string;
  thang: number;
  nam: number;
  ngayTraLuong: string;
  soNgayCongChuan: number;
  trangThai: string;
}

interface BangLuong {
  id: string;
  nhanVienId: string;
  luongCoBan: number;
  thanhTienTangCa: number;
  tongThuNhap: number;
  thueThuNhap: number;
  trangThai: string;
}

interface BangLuongFormData {
  nhanVienId: string;
  luongCoBan: number;
  thanhTienTangCa: number;
  tongThuNhap: number;
  thueThuNhap: number;
}

const API_BASE = 'http://localhost:5000/api';

export default function BangLuongPage() {
  const params = useParams();
  const kyLuongId = params.id as string;

  const [kyLuong, setKyLuong] = useState<KyLuong | null>(null);
  const [bangLuongs, setBangLuongs] = useState<BangLuong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BangLuongFormData>({
    nhanVienId: '',
    luongCoBan: 0,
    thanhTienTangCa: 0,
    tongThuNhap: 0,
    thueThuNhap: 0,
  });

  const refetch = () => setRefreshKey((k) => k + 1);

  // ─── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [klRes, blRes] = await Promise.all([
          fetch(`${API_BASE}/ky-luong/${kyLuongId}`),
          fetch(`${API_BASE}/ky-luong/${kyLuongId}/bang-luong`),
        ]);
        const klJson = await klRes.json();
        const blJson = await blRes.json();

        if (cancelled) return;
        if (klJson.success) setKyLuong(klJson.data);
        if (blJson.success) setBangLuongs(blJson.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [kyLuongId, refreshKey]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_BASE}/ky-luong/${kyLuongId}/bang-luong/${editingId}`
        : `${API_BASE}/ky-luong/${kyLuongId}/bang-luong`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        refetch();
      } else {
        const err = await res.json();
        alert(err.message || 'Có lỗi xảy ra');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bản ghi lương này?')) return;
    try {
      await fetch(`${API_BASE}/ky-luong/${kyLuongId}/bang-luong/${id}`, {
        method: 'DELETE',
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!confirm(`Xác nhận chuyển trạng thái kỳ lương thành ${status}?`)) return;
    try {
      await fetch(`${API_BASE}/ky-luong/${kyLuongId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThai: status }),
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCalculate = async (bl: BangLuong) => {
    const taxBracket = Number(localStorage.getItem('payroll_taxBracket') || '11000000');
    const taxRate = Number(localStorage.getItem('payroll_taxRate') || '10') / 100;

    const tongThuNhapMoi = bl.luongCoBan + bl.thanhTienTangCa;
    const phanVuot = Math.max(0, tongThuNhapMoi - taxBracket);
    const thueThuNhapMoi = phanVuot * taxRate;

    try {
      await fetch(`${API_BASE}/ky-luong/${kyLuongId}/bang-luong/${bl.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tongThuNhap: tongThuNhapMoi,
          thueThuNhap: thueThuNhapMoi,
          trangThai: 'CALCULATED',
        }),
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (blId: string) => {
    try {
      await fetch(`${API_BASE}/ky-luong/${kyLuongId}/bang-luong/${blId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trangThai: 'APPROVED',
          nguoiDuyet: 'System HR',
          ngayDuyet: new Date().toISOString(),
        }),
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    if (!kyLuong) return;
    const csvData = bangLuongs.map((bl) => ({
      'Mã Nhân Viên': bl.nhanVienId,
      'Lương Cơ Bản': bl.luongCoBan,
      'Tiền Tăng Ca': bl.thanhTienTangCa,
      'Tổng Thu Nhập': bl.tongThuNhap,
      'Thuế TNCN': bl.thueThuNhap,
      'Thực Nhận': bl.tongThuNhap - bl.thueThuNhap,
      'Trạng Thái': bl.trangThai,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BangLuong_${kyLuong.tenKy}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedData = results.data
          .map((row) => ({
            nhanVienId: row['Mã Nhân Viên'] || row['nhanVienId'],
            luongCoBan: Number(row['Lương Cơ Bản'] || row['luongCoBan']) || 0,
            thanhTienTangCa:
              Number(row['Tiền Tăng Ca'] || row['thanhTienTangCa']) || 0,
          }))
          .filter((r) => r.nhanVienId);

        if (parsedData.length === 0) {
          alert('File không hợp lệ hoặc không có dữ liệu!');
          return;
        }

        try {
          const res = await fetch(
            `${API_BASE}/ky-luong/${kyLuongId}/bang-luong/bulk`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsedData),
            }
          );
          const json = await res.json();
          if (json.success) {
            alert(`Đã import thành công ${json.count} bản ghi!`);
            refetch();
          } else {
            alert(json.message);
          }
        } catch (err) {
          console.error(err);
        }
      },
    });
    e.target.value = '';
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      nhanVienId: '',
      luongCoBan: 0,
      thanhTienTangCa: 0,
      tongThuNhap: 0,
      thueThuNhap: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (bl: BangLuong) => {
    setEditingId(bl.id);
    setFormData({
      nhanVienId: bl.nhanVienId,
      luongCoBan: bl.luongCoBan,
      thanhTienTangCa: bl.thanhTienTangCa,
      tongThuNhap: bl.tongThuNhap,
      thueThuNhap: bl.thueThuNhap,
    });
    setShowModal(true);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // ─── Render guards ───────────────────────────────────────────────────────────
  if (loading) return <div className="text-center py-20 text-slate-500">Đang tải...</div>;
  if (!kyLuong) return <div className="text-center py-20 text-rose-500">Không tìm thấy kỳ lương</div>;

  const isLocked =
    kyLuong.trangThai === 'LOCKED' ||
    kyLuong.trangThai === 'PAID' ||
    kyLuong.trangThai === 'CLOSED';

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/payroll"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{kyLuong.tenKy}</h1>
          <p className="text-slate-500 text-sm">
            Tháng {kyLuong.thang}/{kyLuong.nam} • Trạng thái:{' '}
            <span className="font-semibold text-indigo-600">{kyLuong.trangThai}</span>
          </p>
        </div>
      </div>

      {/* Info + Actions bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-slate-500">Ngày trả lương</p>
            <p className="font-semibold text-slate-900">
              {new Date(kyLuong.ngayTraLuong).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Công chuẩn</p>
            <p className="font-semibold text-slate-900">{kyLuong.soNgayCongChuan} ngày</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Tổng nhân sự</p>
            <p className="font-semibold text-slate-900">{bangLuongs.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          {!isLocked && (
            <>
              <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />
              </label>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm Bảng Lương
              </button>

              <button
                onClick={() => handleUpdateStatus('LOCKED')}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
              >
                <Lock className="w-4 h-4" />
                Khóa Kỳ Lương
              </button>
            </>
          )}

          {kyLuong.trangThai === 'LOCKED' && (
            <button
              onClick={() => handleUpdateStatus('PAID')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Đánh dấu Đã Thanh Toán
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Mã NV</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Lương Cơ Bản</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Tiền Tăng Ca</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Tổng Thu Nhập</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Thuế TNCN</th>
              <th className="px-6 py-4 font-semibold text-emerald-700 text-right">Thực Nhận</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-center">Trạng Thái</th>
              {!isLocked && (
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Thao tác</th>
              )}
              {isLocked && (
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">In Phiếu</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bangLuongs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  Chưa có dữ liệu bảng lương.
                </td>
              </tr>
            ) : (
              bangLuongs.map((bl) => {
                const thucNhan = bl.tongThuNhap - bl.thueThuNhap;
                return (
                  <tr key={bl.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{bl.nhanVienId}</td>
                    <td className="px-6 py-4 text-slate-600">{formatCurrency(bl.luongCoBan)}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatCurrency(bl.thanhTienTangCa)}
                    </td>
                    <td className="px-6 py-4 text-indigo-600 font-semibold">
                      {formatCurrency(bl.tongThuNhap)}
                    </td>
                    <td className="px-6 py-4 text-rose-600">{formatCurrency(bl.thueThuNhap)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold text-right">
                      {formatCurrency(thucNhan)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={[
                          'inline-flex items-center px-2 py-1 rounded text-xs font-semibold',
                          bl.trangThai === 'DRAFT' ? 'bg-slate-100 text-slate-600' : '',
                          bl.trangThai === 'CALCULATED' ? 'bg-blue-100 text-blue-700' : '',
                          bl.trangThai === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : '',
                        ].join(' ')}
                      >
                        {bl.trangThai}
                      </span>
                    </td>

                    {!isLocked && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {bl.trangThai === 'DRAFT' && (
                            <button
                              onClick={() => handleCalculate(bl)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Tính Lương"
                            >
                              <Calculator className="w-4 h-4" />
                            </button>
                          )}
                          {bl.trangThai === 'CALCULATED' && (
                            <button
                              onClick={() => handleApprove(bl.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Duyệt Lương"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(bl)}
                            className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Sửa bản ghi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bl.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}

                    {isLocked && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={handlePrint}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex justify-center"
                          title="In Phiếu Lương"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 px-6 py-4 text-white">
              <h2 className="text-xl font-bold">
                {editingId ? 'Sửa Bảng Lương' : 'Thêm Bảng Lương'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã Nhân Viên (External Key)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nhanVienId}
                    onChange={(e) => setFormData({ ...formData, nhanVienId: e.target.value })}
                    placeholder="VD: NV001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    disabled={!!editingId}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Lương Cơ Bản
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.luongCoBan}
                      onChange={(e) =>
                        setFormData({ ...formData, luongCoBan: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tiền Tăng Ca
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.thanhTienTangCa}
                      onChange={(e) =>
                        setFormData({ ...formData, thanhTienTangCa: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tổng Thu Nhập
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.tongThuNhap}
                      onChange={(e) =>
                        setFormData({ ...formData, tongThuNhap: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Thuế TNCN
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.thueThuNhap}
                      onChange={(e) =>
                        setFormData({ ...formData, thueThuNhap: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Thực nhận dự kiến:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatCurrency(formData.tongThuNhap - formData.thueThuNhap)}
                  </span>
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
                  {editingId ? 'Cập nhật' : 'Lưu bản ghi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
