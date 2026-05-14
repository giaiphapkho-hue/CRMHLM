import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 shrink-0">
          <h2 className="text-slate-800 font-semibold text-lg">B2B Industrial CRM</h2>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-slate-500">giaiphapkho@gmail.com</span>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
              GL
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
