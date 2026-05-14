import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Kanban, Layers, Code, Settings, Users, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const links = [
    { name: 'Bảng điều khiển', to: '/', icon: LayoutDashboard },
    { name: 'Tiềm năng & Khách hàng', to: '/accounts', icon: Users },
    { name: 'Quy trình Kinh doanh', to: '/pipeline', icon: Kanban },
    { name: 'Cơ sở vật chất (Assets)', to: '/assets', icon: Layers },
    { name: 'AI Lead Scoring', to: '/lead-scoring', icon: Star },
    { name: 'Tài liệu API (Docs)', to: '/docs', icon: Code },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed top-0 left-0">
      <div className="px-6 py-8 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">HLM CRM</h1>
        <p className="text-xs text-slate-400 mt-1">Hoa Long Mechanical</p>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-slate-800 text-orange-400" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              )
            }
          >
            <link.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button className="flex items-center text-sm font-medium text-slate-400 hover:text-white w-full px-3 py-2">
          <Settings className="w-5 h-5 mr-3" />
          Cài đặt
        </button>
      </div>
    </div>
  );
}
