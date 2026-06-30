'use client';

import { useEffect, useState, useCallback } from 'react';
import { chamCongApi, nhanVienApi } from '@/lib/api';
import { ChamCong, NhanVien, PaginatedResponse } from '@/types';
import { formatDate, getTrangThaiChamCongLabel, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ChamCongPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<PaginatedResponse<ChamCong> | null>(null);
  const [nhanVienList, setNhanVienList] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNV, setFilterNV] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ChamCong | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nhan_vien_id: '', ky_luong_id: '1', ngay: '',
    so_gio_lam: '', so_gio_tang_ca: '', ghi_chu: '',
    trang_thai: 'chua_duyet', nguoi_nhap: '',
  });

  useEffect(() => {
    nhanVienApi.list('per_page=100&trang_thai_lam_viec=dang_lam').then((res) => {
      const r = res as PaginatedResponse<NhanVien>;
      setNhanVienList(r.data || []);
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '10');
      if (filterNV) params.set('nhan_vien_id', filterNV);
      if (filterStatus) params.set('trang_thai', filterStatus);
      if (filterDateFrom) params.set('ngay_tu', filterDateFrom);
      if (filterDateTo) params.set('ngay_den', filterDateTo);
      const res = await chamCongApi.list(params.toString()) as PaginatedResponse<ChamCong>;
      setData(res);
    } catch {
      showToast('Lỗi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filterNV, filterStatus, filterDateFrom, filterDateTo, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ nhan_vien_id: '', ky_luong_id: '1', ngay: new Date().toISOString().split('T')[0], so_gio_lam: '8', so_gio_tang_ca: '0', ghi_chu: '', trang_thai: 'chua_duyet', nguoi_nhap: 'Admin' });
    setShowModal(true);
  };

  const openEdit = (item: ChamCong) => {
    setEditItem(item);
    setForm({
      nhan_vien_id: String(item.nhan_vien_id), ky_luong_id: String(item.ky_luong_id),
      ngay: item.ngay?.split('T')[0] || '', so_gio_lam: item.so_gio_lam || '',
      so_gio_tang_ca: item.so_gio_tang_ca || '', ghi_chu: item.ghi_chu || '',
      trang_thai: item.trang_thai, nguoi_nhap: item.nguoi_nhap,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        nhan_vien_id: Number(form.nhan_vien_id),
        ky_luong_id: Number(form.ky_luong_id),
        so_gio_lam: form.so_gio_lam ? Number(form.so_gio_lam) : null,
        so_gio_tang_ca: form.so_gio_tang_ca ? Number(form.so_gio_tang_ca) : null,
        ghi_chu: form.ghi_chu || null,
      };
      if (editItem) {
        await chamCongApi.update(editItem.cham_cong_id, payload);
        showToast('Cập nhật chấm công thành công', 'success');
      } else {
        await chamCongApi.create(payload);
        showToast('Thêm chấm công thành công', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await chamCongApi.delete(deleteId);
      showToast('Xóa chấm công thành công', 'success');
      setDeleteId(null);
      loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div />
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm chấm công</button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <select className="form-select" style={{ width: 'auto', minWidth: '200px' }} value={filterNV} onChange={(e) => { setFilterNV(e.target.value); setPage(1); }}>
              <option value="">Tất cả nhân viên</option>
              {nhanVienList.map((nv) => <option key={nv.nhan_vien_id} value={nv.nhan_vien_id}>{nv.ho_ten}</option>)}
            </select>
            <select className="form-select" style={{ width: 'auto', minWidth: '140px' }} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">Trạng thái</option>
              <option value="chua_duyet">Chưa duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
            </select>
            <input className="form-input" type="date" style={{ width: 'auto' }} value={filterDateFrom} onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1); }} title="Từ ngày" />
            <input className="form-input" type="date" style={{ width: 'auto' }} value={filterDateTo} onChange={(e) => { setFilterDateTo(e.target.value); setPage(1); }} title="Đến ngày" />
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Tổng: {data?.total || 0}</div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nhân viên</th>
                  <th>Phòng ban</th>
                  <th>Ngày</th>
                  <th>Giờ làm</th>
                  <th>Tăng ca</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái</th>
                  <th>Người nhập</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 ? (
                  <tr><td colSpan={10}><div className="table-empty"><div className="empty-icon">📋</div><p>Không có dữ liệu chấm công</p></div></td></tr>
                ) : (
                  data?.data?.map((item) => (
                    <tr key={item.cham_cong_id}>
                      <td>{item.cham_cong_id}</td>
                      <td style={{ fontWeight: 600 }}>{item.nhan_vien?.ho_ten || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.nhan_vien?.chuc_vu?.phong_ban?.ten_phong_ban || '—'}</td>
                      <td>{formatDate(item.ngay)}</td>
                      <td>{item.so_gio_lam || '0'}h</td>
                      <td style={{ color: Number(item.so_gio_tang_ca) > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                        {item.so_gio_tang_ca || '0'}h
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.ghi_chu || '—'}</td>
                      <td><span className={`badge ${getStatusColor(item.trang_thai)}`}>{getTrangThaiChamCongLabel(item.trang_thai)}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.nguoi_nhap}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(item.cham_cong_id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {data && data.last_page > 1 && (
              <div className="pagination">
                <div className="pagination-info">Trang {data.current_page} / {data.last_page} ({data.total} kết quả)</div>
                <div className="pagination-buttons">
                  <button className="pagination-btn" disabled={data.current_page <= 1} onClick={() => setPage(page - 1)}>‹</button>
                  {Array.from({ length: data.last_page }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={`pagination-btn ${p === data.current_page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                  <button className="pagination-btn" disabled={data.current_page >= data.last_page} onClick={() => setPage(page + 1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Sửa chấm công' : 'Thêm chấm công mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nhân viên <span className="required">*</span></label>
                  <select className="form-select" required value={form.nhan_vien_id} onChange={(e) => setForm({ ...form, nhan_vien_id: e.target.value })}>
                    <option value="">-- Chọn nhân viên --</option>
                    {nhanVienList.map((nv) => <option key={nv.nhan_vien_id} value={nv.nhan_vien_id}>{nv.ho_ten}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày <span className="required">*</span></label>
                    <input className="form-input" type="date" required value={form.ngay} onChange={(e) => setForm({ ...form, ngay: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kỳ lương ID</label>
                    <input className="form-input" type="number" value={form.ky_luong_id} onChange={(e) => setForm({ ...form, ky_luong_id: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số giờ làm</label>
                    <input className="form-input" type="number" step="0.5" min="0" max="24" value={form.so_gio_lam} onChange={(e) => setForm({ ...form, so_gio_lam: e.target.value })} placeholder="8" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số giờ tăng ca</label>
                    <input className="form-input" type="number" step="0.5" min="0" max="24" value={form.so_gio_tang_ca} onChange={(e) => setForm({ ...form, so_gio_tang_ca: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <textarea className="form-textarea" value={form.ghi_chu} onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })} placeholder="Ghi chú (nếu có)" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-select" value={form.trang_thai} onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}>
                      <option value="chua_duyet">Chưa duyệt</option>
                      <option value="da_duyet">Đã duyệt</option>
                      <option value="tu_choi">Từ chối</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Người nhập <span className="required">*</span></label>
                    <input className="form-input" required value={form.nguoi_nhap} onChange={(e) => setForm({ ...form, nguoi_nhap: e.target.value })} placeholder="Tên người nhập" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : editItem ? 'Cập nhật' : 'Thêm mới'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={deleteId !== null} title="Xóa chấm công?" message="Bạn có chắc muốn xóa bản ghi chấm công này?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </>
  );
}
