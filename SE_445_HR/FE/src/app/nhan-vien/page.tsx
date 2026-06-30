'use client';

import { useEffect, useState, useCallback } from 'react';
import { nhanVienApi, chucVuApi, phongBanApi } from '@/lib/api';
import { NhanVien, ChucVu, PhongBan, PaginatedResponse } from '@/types';
import { formatDate, getGioiTinhLabel, getTrangThaiHopDongLabel, getTrangThaiLamViecLabel, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function NhanVienPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<PaginatedResponse<NhanVien> | null>(null);
  const [phongBanList, setPhongBanList] = useState<PhongBan[]>([]);
  const [chucVuList, setChucVuList] = useState<ChucVu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPB, setFilterPB] = useState('');
  const [filterTTHD, setFilterTTHD] = useState('');
  const [filterTTLV, setFilterTTLV] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<NhanVien | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ho_ten: '', email: '', so_dien_thoai: '', so_cmnd: '', dia_chi: '',
    gioi_tinh: '', ngay_sinh: '', chuc_vu_id: '', ngay_vao_lam: '',
    ngay_ket_thuc: '', trang_thai_hop_dong: 'thu_viec', trang_thai_lam_viec: 'dang_lam',
  });

  useEffect(() => {
    phongBanApi.all().then((res) => setPhongBanList(res as PhongBan[]));
    chucVuApi.all().then((res) => setChucVuList(res as ChucVu[]));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '10');
      if (search) params.set('search', search);
      if (filterPB) params.set('phong_ban_id', filterPB);
      if (filterTTHD) params.set('trang_thai_hop_dong', filterTTHD);
      if (filterTTLV) params.set('trang_thai_lam_viec', filterTTLV);
      const res = await nhanVienApi.list(params.toString()) as PaginatedResponse<NhanVien>;
      setData(res);
    } catch {
      showToast('Lỗi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterPB, filterTTHD, filterTTLV, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ ho_ten: '', email: '', so_dien_thoai: '', so_cmnd: '', dia_chi: '', gioi_tinh: '', ngay_sinh: '', chuc_vu_id: '', ngay_vao_lam: '', ngay_ket_thuc: '', trang_thai_hop_dong: 'thu_viec', trang_thai_lam_viec: 'dang_lam' });
    setShowModal(true);
  };

  const openEdit = (item: NhanVien) => {
    setEditItem(item);
    setForm({
      ho_ten: item.ho_ten, email: item.email || '', so_dien_thoai: item.so_dien_thoai || '',
      so_cmnd: item.so_cmnd || '', dia_chi: item.dia_chi || '', gioi_tinh: item.gioi_tinh || '',
      ngay_sinh: item.ngay_sinh?.split('T')[0] || '', chuc_vu_id: String(item.chuc_vu_id),
      ngay_vao_lam: item.ngay_vao_lam?.split('T')[0] || '', ngay_ket_thuc: item.ngay_ket_thuc?.split('T')[0] || '',
      trang_thai_hop_dong: item.trang_thai_hop_dong, trang_thai_lam_viec: item.trang_thai_lam_viec,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        chuc_vu_id: Number(form.chuc_vu_id),
        email: form.email || null,
        so_dien_thoai: form.so_dien_thoai || null,
        so_cmnd: form.so_cmnd || null,
        dia_chi: form.dia_chi || null,
        gioi_tinh: form.gioi_tinh || null,
        ngay_sinh: form.ngay_sinh || null,
        ngay_ket_thuc: form.ngay_ket_thuc || null,
      };
      if (editItem) {
        await nhanVienApi.update(editItem.nhan_vien_id, payload);
        showToast('Cập nhật nhân viên thành công', 'success');
      } else {
        await nhanVienApi.create(payload);
        showToast('Thêm nhân viên thành công', 'success');
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
      await nhanVienApi.delete(deleteId);
      showToast('Xóa nhân viên thành công', 'success');
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
        <div>
          <h1 className="page-title">👥 Nhân Viên</h1>
          <p className="page-subtitle">Quản lý hồ sơ nhân viên công ty</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Thêm nhân viên</button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-input">
              <span className="search-icon">🔍</span>
              <input className="form-input" placeholder="Tìm theo tên, email, SĐT..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select" style={{ width: 'auto', minWidth: '160px' }} value={filterPB} onChange={(e) => { setFilterPB(e.target.value); setPage(1); }}>
              <option value="">Tất cả phòng ban</option>
              {phongBanList.map((pb) => <option key={pb.phong_ban_id} value={pb.phong_ban_id}>{pb.ten_phong_ban}</option>)}
            </select>
            <select className="form-select" style={{ width: 'auto', minWidth: '140px' }} value={filterTTLV} onChange={(e) => { setFilterTTLV(e.target.value); setPage(1); }}>
              <option value="">Trạng thái LV</option>
              <option value="dang_lam">Đang làm</option>
              <option value="nghi_phep">Nghỉ phép</option>
              <option value="nghi_viec">Nghỉ việc</option>
            </select>
            <select className="form-select" style={{ width: 'auto', minWidth: '140px' }} value={filterTTHD} onChange={(e) => { setFilterTTHD(e.target.value); setPage(1); }}>
              <option value="">Hợp đồng</option>
              <option value="thu_viec">Thử việc</option>
              <option value="chinh_thuc">Chính thức</option>
              <option value="het_han">Hết hạn</option>
              <option value="da_nghi">Đã nghỉ</option>
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
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Giới tính</th>
                  <th>Chức vụ</th>
                  <th>Phòng ban</th>
                  <th>Ngày vào</th>
                  <th>Hợp đồng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 ? (
                  <tr><td colSpan={11}><div className="table-empty"><div className="empty-icon">👥</div><p>Không tìm thấy nhân viên</p></div></td></tr>
                ) : (
                  data?.data?.map((item) => (
                    <tr key={item.nhan_vien_id}>
                      <td>{item.nhan_vien_id}</td>
                      <td style={{ fontWeight: 600 }}>{item.ho_ten}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.email || '—'}</td>
                      <td>{item.so_dien_thoai || '—'}</td>
                      <td>{getGioiTinhLabel(item.gioi_tinh)}</td>
                      <td>{item.chuc_vu?.ten_chuc_vu || '—'}</td>
                      <td>{item.chuc_vu?.phong_ban?.ten_phong_ban || '—'}</td>
                      <td>{formatDate(item.ngay_vao_lam)}</td>
                      <td><span className={`badge ${getStatusColor(item.trang_thai_hop_dong)}`}>{getTrangThaiHopDongLabel(item.trang_thai_hop_dong)}</span></td>
                      <td><span className={`badge ${getStatusColor(item.trang_thai_lam_viec)}`}>{getTrangThaiLamViecLabel(item.trang_thai_lam_viec)}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(item.nhan_vien_id)}>🗑️</button>
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
          <div className="modal" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Họ tên <span className="required">*</span></label>
                    <input className="form-input" required value={form.ho_ten} onChange={(e) => setForm({ ...form, ho_ten: e.target.value })} placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@acme.vn" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input className="form-input" value={form.so_dien_thoai} onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value })} placeholder="0901234567" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số CMND/CCCD</label>
                    <input className="form-input" value={form.so_cmnd} onChange={(e) => setForm({ ...form, so_cmnd: e.target.value })} placeholder="079123456789" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Giới tính</label>
                    <select className="form-select" value={form.gioi_tinh} onChange={(e) => setForm({ ...form, gioi_tinh: e.target.value })}>
                      <option value="">-- Chọn --</option>
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <input className="form-input" type="date" value={form.ngay_sinh} onChange={(e) => setForm({ ...form, ngay_sinh: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ</label>
                  <textarea className="form-textarea" value={form.dia_chi} onChange={(e) => setForm({ ...form, dia_chi: e.target.value })} placeholder="Địa chỉ thường trú" />
                </div>
                <div className="form-group">
                  <label className="form-label">Chức vụ <span className="required">*</span></label>
                  <select className="form-select" required value={form.chuc_vu_id} onChange={(e) => setForm({ ...form, chuc_vu_id: e.target.value })}>
                    <option value="">-- Chọn chức vụ --</option>
                    {chucVuList.map((cv) => <option key={cv.chuc_vu_id} value={cv.chuc_vu_id}>{cv.ten_chuc_vu} ({cv.cap_bac})</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày vào làm <span className="required">*</span></label>
                    <input className="form-input" type="date" required value={form.ngay_vao_lam} onChange={(e) => setForm({ ...form, ngay_vao_lam: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày kết thúc</label>
                    <input className="form-input" type="date" value={form.ngay_ket_thuc} onChange={(e) => setForm({ ...form, ngay_ket_thuc: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Trạng thái hợp đồng <span className="required">*</span></label>
                    <select className="form-select" value={form.trang_thai_hop_dong} onChange={(e) => setForm({ ...form, trang_thai_hop_dong: e.target.value })}>
                      <option value="thu_viec">Thử việc</option>
                      <option value="chinh_thuc">Chính thức</option>
                      <option value="het_han">Hết hạn</option>
                      <option value="da_nghi">Đã nghỉ</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trạng thái làm việc <span className="required">*</span></label>
                    <select className="form-select" value={form.trang_thai_lam_viec} onChange={(e) => setForm({ ...form, trang_thai_lam_viec: e.target.value })}>
                      <option value="dang_lam">Đang làm</option>
                      <option value="nghi_phep">Nghỉ phép</option>
                      <option value="nghi_viec">Nghỉ việc</option>
                    </select>
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

      <ConfirmDialog isOpen={deleteId !== null} title="Xóa nhân viên?" message="Bạn có chắc muốn xóa nhân viên này? Hành động không thể hoàn tác." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </>
  );
}
