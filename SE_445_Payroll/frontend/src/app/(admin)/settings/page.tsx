"use client";

import { useState } from 'react';
import { User, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="text-slate-500 mt-1">Quản lý tài khoản và tùy chỉnh hệ thống của bạn.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Settings */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Lock className="w-5 h-5" />
              Bảo mật & Mật khẩu
            </button>
            {user.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('payroll')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === 'payroll' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Shield className="w-5 h-5" />
                Cấu hình Lương & Thuế
              </button>
            )}
          </nav>
        </div>

        {/* Content Settings */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Thông tin cá nhân</h3>
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 mb-2">
                    Thay đổi ảnh đại diện
                  </button>
                  <p className="text-xs text-slate-500">JPG, GIF hoặc PNG. Tối đa 2MB.</p>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" disabled value={user.email} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                    <input type="text" disabled value={user.role} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button type="button" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Đổi mật khẩu</h3>
              <form className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="pt-4">
                  <button type="button" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Cập nhật mật khẩu
                  </button>
                </div>
              </form>
            </div>
          )}

          {(activeTab === 'system' || activeTab === 'notifications') && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tính năng đang phát triển</h3>
              <p className="text-slate-500 max-w-sm">Phần cài đặt này sẽ được cập nhật trong các phiên bản tiếp theo của hệ thống.</p>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900">Cấu hình tham số Tiền Lương</h2>
              </div>
              <form 
  className="p-6 space-y-4"
  onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const taxBracket = (formEl.elements.namedItem('taxBracket') as HTMLInputElement).value;
    const taxRate = (formEl.elements.namedItem('taxRate') as HTMLInputElement).value;
    localStorage.setItem('payroll_taxBracket', taxBracket);
    localStorage.setItem('payroll_taxRate', taxRate);
    alert('Cập nhật cấu hình thành công!');
  }}
>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mức giảm trừ thuế (Thu nhập không chịu thuế)</label>
                  <input 
                    name="taxBracket" type="number" 
                    defaultValue={typeof window !== 'undefined' ? (localStorage.getItem('payroll_taxBracket') || '11000000') : '11000000'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                  <p className="text-xs text-slate-500 mt-1">VD: 11000000 (11 triệu VNĐ)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thuế suất (%)</label>
                  <input 
                    name="taxRate" type="number" step="0.1" 
                    defaultValue={typeof window !== 'undefined' ? (localStorage.getItem('payroll_taxRate') || '10') : '10'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                  <p className="text-xs text-slate-500 mt-1">VD: 10 (Áp dụng cho phần vượt mức giảm trừ)</p>
                </div>
                <div className="pt-4">
                  <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Lưu cấu hình
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
