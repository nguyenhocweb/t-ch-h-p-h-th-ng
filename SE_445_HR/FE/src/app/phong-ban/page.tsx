'use client';

import { useEffect, useState, useCallback } from 'react';
import { phongBanApi } from '@/lib/api';
import { PhongBan, PaginatedResponse } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function PhongBanPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<PaginatedResponse<PhongBan> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<PhongBan | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ten_phong_ban: '',
    mo_ta: '',
    ngay_thanh_lap: '',
    trang_thai: 'active',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '10');
      if (search) params.set('search', search);
      const res = await phongBanApi.list(params.toString()) as PaginatedResponse<PhongBan>;
      setData(res);
    } catch {
      showToast('Lỗi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ ten_phong_ban: '', mo_ta: '', ngay_thanh_lap: '', trang_thai: 'active' });
    setShowModal(true);
  };

  const openEdit = (item: PhongBan) => {
    setEditItem(item);
    setForm({
      ten_phong_ban: item.ten_phong_ban,
      mo_ta: item.mo_ta || '',
      ngay_thanh_lap: item.ngay_thanh_lap?.split('T')[0] || '',
      trang_thai: item.trang_thai,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await phongBanApi.update(editItem.phong_ban_id, form);
        showToast('Cập nhật phòng ban thành công', 'success');
      } else {
        await phongBanApi.create(form);
        showToast('Thêm phòng ban thành công', 'success');
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
      await phongBanApi.delete(deleteId);
      showToast('Xóa phòng ban thành công', 'success');
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
        <button className="btn btn-primary" onClick={openCreate}>
          + Thêm phòng ban
        </button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-input">
              <span className="search-icon">🔍</span>
              <input
                className="form-input"
                placeholder="Tìm kiếm phòng ban..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Tổng: {data?.total || 0} phòng ban
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên phòng ban</th>
                  <th>Mô tả</th>
                  <th>Ngày thành lập</th>
                  <th>Số chức vụ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="table-empty">
                        <div className="empty-icon">🏢</div>
                        <p>Chưa có phòng ban nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data?.data?.map((item) => (
                    <tr key={item.phong_ban_id}>
                      <td>{item.phong_ban_id}</td>
                      <td style={{ fontWeight: 600 }}>{item.ten_phong_ban}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.mo_ta || '—'}
                      </td>
                      <td>{formatDate(item.ngay_thanh_lap)}</td>
                      <td>{item.chuc_vu_count ?? 0}</td>
                      <td>
                        <span className={`badge ${getStatusColor(item.trang_thai)}`}>
                          {item.trang_thai === 'active' ? 'Hoạt động' : 'Ngừng'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(item.phong_ban_id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {data && data.last_page > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Trang {data.current_page} / {data.last_page} ({data.total} kết quả)
                </div>
                <div className="pagination-buttons">
                  <button className="pagination-btn" disabled={data.current_page <= 1} onClick={() => setPage(page - 1)}>‹</button>
                  {Array.from({ length: data.last_page }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={`pagination-btn ${p === data.current_page ? 'active' : ''}`} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  ))}
                  <button className="pagination-btn" disabled={data.current_page >= data.last_page} onClick={() => setPage(page + 1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Sửa phòng ban' : 'Thêm phòng ban mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Tên phòng ban <span className="required">*</span></label>
                  <input className="form-input" required value={form.ten_phong_ban} onChange={(e) => setForm({ ...form, ten_phong_ban: e.target.value })} placeholder="Nhập tên phòng ban" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-textarea" value={form.mo_ta} onChange={(e) => setForm({ ...form, mo_ta: e.target.value })} placeholder="Mô tả phòng ban" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày thành lập <span className="required">*</span></label>
                    <input className="form-input" type="date" required value={form.ngay_thanh_lap} onChange={(e) => setForm({ ...form, ngay_thanh_lap: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-select" value={form.trang_thai} onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Ngừng hoạt động</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : editItem ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Xóa phòng ban?"
        message="Bạn có chắc muốn xóa phòng ban này? Hành động không thể hoàn tác."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={saving}
      />
    </>
  );
}
