import { useState } from 'react';
import { useCrm } from '../store/CrmContext';
import { Search } from 'lucide-react';

export default function Accounts() {
  const { companies } = useCrm();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = companies.filter((company: any) => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Khách hàng Doanh nghiệp (Account-Based CRM)</h1>
          <p className="text-slate-500">Quản lý Tài khoản &gt; Chi nhánh &gt; Người liên hệ</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
            placeholder="Tìm kiếm công ty theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredCompanies.map((company: any) => (
          <div key={company.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-2">{company.name}</h2>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 mb-6">
              {company.industry}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Chi nhánh / Kho hàng</h3>
                <ul className="space-y-3">
                  {(company.sites || []).map((site: any) => (
                    <li key={site.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="font-medium text-slate-800">{site.name}</p>
                      <p className="text-sm text-slate-500">{site.address}</p>
                    </li>
                  ))}
                  {(company.sites || []).length === 0 && <p className="text-sm text-slate-500">Chưa có chi nhánh</p>}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Người liên hệ</h3>
                <ul className="space-y-3">
                  {(company.contacts || []).map((contact: any) => (
                    <li key={contact.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800">{contact.name}</p>
                        <p className="text-sm text-slate-500">{contact.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{contact.email} • {contact.phone}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                        Điểm: {contact.score}
                      </span>
                    </li>
                  ))}
                  {(company.contacts || []).length === 0 && <p className="text-sm text-slate-500">Chưa có người liên hệ</p>}
                </ul>
              </div>
            </div>
          </div>
        ))}
        {companies.length === 0 && (
          <p className="text-slate-500 text-center py-10">Chưa có dữ liệu. Hãy khởi tạo từ Bảng điều khiển.</p>
        )}
        {companies.length > 0 && filteredCompanies.length === 0 && (
          <p className="text-slate-500 text-center py-10">Không tìm thấy khách hàng nào phù hợp với "{searchQuery}".</p>
        )}
      </div>
    </div>
  );
}
