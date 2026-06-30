'use client';

import { useEffect, useState, useCallback } from 'react';
import { chucVuApi, phongBanApi } from '@/lib/api';
import { ChucVu, PhongBan, PaginatedResponse } from '@/types';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ChucVuPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<PaginatedResponse<ChucVu> | null>(null);
  const [phongBanList, setPhongBanList] = useState<PhongBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPB, setFilterPB] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ChucVu | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ten_chuc_vu: '',
    cap_bac: '',
    phong_ban_id: '',
    mo_ta_cong_viec: '',
    luong_co_ban_min: '',
    luong_co_ban_max: '',
    trang_thai: 'active',
  });

  useEffect(() => {
    phongBanApi.all().then((res) => setPhongBanList(res as PhongBan[]));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '10');
      if (search) params.set('search', search);
      if (filterPB) params.set('phong_ban_id', filterPB);
      const res = await chucVuApi.list(params.toString()) as PaginatedResponse<ChucVu>;
      setData(res);
    } catch {
      showToast('Lỗi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterPB, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ ten_chuc_vu: '', cap_bac: '', phong_ban_id: '', mo_ta_cong_viec: '', luong_co_ban_min: '', luong_co_ban_max: '', trang_thai: 'active' });
    setShowModal(true);
  };

  const openEdit = (item: ChucVu) => {
    setEditItem(item);
    setForm({
      ten_chuc_vu: item.ten_chuc_vu,
      cap_bac: item.cap_bac,
      phong_ban_id: String(item.phong_ban_id),
      mo_ta_cong_viec: item.mo_ta_cong_viec || '',
      luong_co_ban_min: item.luong_co_ban_min,
      luong_co_ban_max: item.luong_co_ban_max,
      trang_thai: item.trang_thai,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, phong_ban_id: Number(form.phong_ban_id), luong_co_ban_min: Number(form.luong_co_ban_min), luong_co_ban_max: Number(form.luong_co_ban_max) };
      if (editItem) {
        await chucVuApi.update(editItem.chuc_vu_id, payload);
        showToast('Cập nhật chức vụ thành công', 'success');
      } else {
        await chucVuApi.create(payload);
        showToast('Thêm chức vụ thành công', 'success');
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
      await chucVuApi.delete(deleteId);
      showToast('Xóa chức vụ thành công', 'success');
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
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm chức vụ</button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-input">
              <span className="search-icon">🔍</span>
              <input className="form-input" placeholder="Tìm kiếm chức vụ..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select" style={{ width: 'auto', minWidth: '180px' }} value={filterPB} onChange={(e) => { setFilterPB(e.target.value); setPage(1); }}>
              <option value="">Tất cả phòng ban</option>
              {phongBanList.map((pb) => (
                <option key={pb.phong_ban_id} value={pb.phong_ban_id}>{pb.ten_phong_ban}</option>
              ))}
            </select>
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
                  <th>Chức vụ</th>
                  <th>Cấp bậc</th>
                  <th>Phòng ban</th>
                  <th>Lương tối thiểu</th>
                  <th>Lương tối đa</th>
                  <th>Số NV</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 ? (
                  <tr><td colSpan={9}><div className="table-empty"><div className="empty-icon">👔</div><p>Chưa có chức vụ nào</p></div></td></tr>
                ) : (
                  data?.data?.map((item) => (
                    <tr key={item.chuc_vu_id}>
                      <td>{item.chuc_vu_id}</td>
                      <td style={{ fontWeight: 600 }}>{item.ten_chuc_vu}</td>
                      <td><span className="badge badge-info">{item.cap_bac}</span></td>
                      <td>{item.phong_ban?.ten_phong_ban || '—'}</td>
                      <td>{formatCurrency(item.luong_co_ban_min)}</td>
                      <td>{formatCurrency(item.luong_co_ban_max)}</td>
                      <td>{item.nhan_vien_count ?? 0}</td>
                      <td><span className={`badge ${getStatusColor(item.trang_thai)}`}>{item.trang_thai === 'active' ? 'Hoạt động' : 'Ngừng'}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(item.chuc_vu_id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {data && data.last_page > 1 && (
              <div className="pagination">
                <div className="pagination-info">Trang {data.current_page} / {data.last_page}</div>
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
              <h2 className="modal-title">{editItem ? 'Sửa chức vụ' : 'Thêm chức vụ mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tên chức vụ <span className="required">*</span></label>
                    <input className="form-input" required value={form.ten_chuc_vu} onChange={(e) => setForm({ ...form, ten_chuc_vu: e.target.value })} placeholder="Nhập tên chức vụ" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cấp bậc <span className="required">*</span></label>
                    <input className="form-input" required value={form.cap_bac} onChange={(e) => setForm({ ...form, cap_bac: e.target.value })} placeholder="VD: Trưởng phòng, Nhân viên" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phòng ban <span className="required">*</span></label>
                  <select className="form-select" required value={form.phong_ban_id} onChange={(e) => setForm({ ...form, phong_ban_id: e.target.value })}>
                    <option value="">-- Chọn phòng ban --</option>
                    {phongBanList.map((pb) => (
                      <option key={pb.phong_ban_id} value={pb.phong_ban_id}>{pb.ten_phong_ban}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả công việc</label>
                  <textarea className="form-textarea" value={form.mo_ta_cong_viec} onChange={(e) => setForm({ ...form, mo_ta_cong_viec: e.target.value })} placeholder="Mô tả công việc" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Lương tối thiểu (VND) <span className="required">*</span></label>
                    <input className="form-input" type="number" required value={form.luong_co_ban_min} onChange={(e) => setForm({ ...form, luong_co_ban_min: e.target.value })} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lương tối đa (VND) <span className="required">*</span></label>
                    <input className="form-input" type="number" required value={form.luong_co_ban_max} onChange={(e) => setForm({ ...form, luong_co_ban_max: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-select" value={form.trang_thai} onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
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

      <ConfirmDialog isOpen={deleteId !== null} title="Xóa chức vụ?" message="Bạn có chắc muốn xóa chức vụ này?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </>
  );
}
