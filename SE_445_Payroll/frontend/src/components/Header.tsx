import { Bell, Search, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-9 pr-4 py-2 w-64 text-sm bg-slate-100 border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        
        <div className="flex items-center gap-3 cursor-pointer p-1 pr-2 rounded-full hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            AD
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-slate-700 leading-none">Admin User</p>
            <p className="text-xs text-slate-500 mt-1">Quản trị viên</p>
          </div>
        </div>
      </div>
    </header>
  );
}
