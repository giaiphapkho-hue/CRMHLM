import { useCrm } from '../store/CrmContext';
import { TrendingUp, DollarSign, AlertTriangle, Database } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

export default function Dashboard() {
  const { opportunities, assets, seedData } = useCrm();

  // Calculate KPIs
  const wonOpps = opportunities.filter(o => o.stage === 'Đóng hợp đồng' || o.stage === 'Bàn giao');
  const winRate = opportunities.length > 0 ? Math.round((wonOpps.length / opportunities.length) * 100) : 0;
  
  const totalWonValue = wonOpps.reduce((sum, opp) => sum + opp.value, 0);
  const avgOrderValue = wonOpps.length > 0 ? totalWonValue / wonOpps.length : 0;

  // Assets needing maintenance soon (within 60 days)
  const today = new Date();
  const upcomingMaintenance = assets.filter(asset => {
    if (!asset.nextMaintenanceDate) return false;
    const nextDate = new Date(asset.nextMaintenanceDate);
    const diff = differenceInDays(nextDate, today);
    return diff <= 60 && diff >= -30; // Due soon or slightly overdue
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển kinh doanh</h1>
        <button 
          onClick={seedData} 
          className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Database className="w-4 h-4 mr-2" />
          Khởi tạo Dữ liệu Mẫu (Seed DB)
        </button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Tỷ lệ thắng (Win Rate)</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{winRate}%</p>
          <p className="text-sm text-slate-500 mt-1">trên tổng {opportunities.length} cơ hội</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Giá trị Đơn hàng Trung bình</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{formatCurrency(avgOrderValue)}</p>
          <p className="text-sm text-slate-500 mt-1">Đơn hàng thành công</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Bảo trì sắp đến hạn (60 ngày)</h3>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{upcomingMaintenance.length}</p>
          <p className="text-sm text-slate-500 mt-1">Hệ thống kệ cần kiểm tra MRO</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Upcoming Maintenance List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Sắp đến hạn bảo trì (Installed Base)</h3>
          </div>
          <div className="flex-1 overflow-auto p-0">
            <ul className="divide-y divide-slate-100">
              {upcomingMaintenance.map(asset => (
                <li key={asset.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-800">{asset.serialNumber}</p>
                      <p className="text-sm text-slate-500">{asset.type} • {asset.capacity}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {format(new Date(asset.nextMaintenanceDate), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
              {upcomingMaintenance.length === 0 && (
                <li className="p-6 text-center text-slate-500">Chưa có lịch bảo trì nào sắp tới.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Recent Opportunities */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Các cơ hội Kinh doanh Gần đây</h3>
          </div>
          <div className="flex-1 overflow-auto p-0">
            <ul className="divide-y divide-slate-100">
              {opportunities.slice(0, 5).map(opp => (
                <li key={opp.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-800">{opp.title}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(opp.value)}</p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {opp.stage}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
              {opportunities.length === 0 && (
                <li className="p-6 text-center text-slate-500">Chưa có dữ liệu cơ hội kinh doanh.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
