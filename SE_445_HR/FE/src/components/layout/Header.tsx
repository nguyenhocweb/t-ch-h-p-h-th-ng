'use client';

import { usePathname } from 'next/navigation';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Tổng quan hệ thống nhân sự' },
  '/phong-ban': { title: 'Phòng Ban', subtitle: 'Quản lý các phòng ban trong công ty' },
  '/chuc-vu': { title: 'Chức Vụ', subtitle: 'Quản lý chức vụ và cấp bậc' },
  '/nhan-vien': { title: 'Nhân Viên', subtitle: 'Danh sách và thông tin nhân viên' },
  '/cham-cong': { title: 'Chấm Công', subtitle: 'Quản lý chấm công và giờ làm' },
};

export default function Header() {
  const pathname = usePathname();
  const meta = pageMeta[pathname] || { title: 'ACME HR', subtitle: 'Hệ thống nhân sự' };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-title">{meta.title}</div>
        <div className="header-subtitle">{meta.subtitle}</div>
      </div>
      <div className="header-right">
        <button className="header-badge" title="Thông báo">🔔</button>
        <button className="header-badge" title="Cài đặt">⚙️</button>
        <div className="header-user">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <div className="user-name">Admin</div>
            <div className="user-role">Quản trị viên</div>
          </div>
        </div>
      </div>
    </header>
  );
}
