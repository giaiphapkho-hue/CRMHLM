import { useState, useMemo } from 'react';
import { useCrm } from '../store/CrmContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Star } from 'lucide-react';

export default function LeadScoring() {
  const { companies, fetchDashboard } = useCrm();
  const [filterCompanyId, setFilterCompanyId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill company if one is selected in filter
  const [formData, setFormData] = useState({
    companyId: '',
    name: '',
    title: '',
    email: '',
    phone: '',
    behavior: ''
  });

  // Extract all contacts from companies
  const allContacts = useMemo(() => {
    const contacts: any[] = [];
    companies.forEach(c => {
      if (c.contacts && Array.isArray(c.contacts)) {
        c.contacts.forEach((contact: any) => {
          contacts.push({ ...contact, companyName: c.name });
        });
      }
    });
    return contacts.sort((a, b) => b.score - a.score);
  }, [companies]);

  const filteredContacts = filterCompanyId 
    ? allContacts.filter(c => c.companyId === filterCompanyId)
    : allContacts;

  const handleOpenModal = () => {
    setFormData(prev => ({ ...prev, companyId: filterCompanyId }));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data);
      fetchDashboard();
      setIsModalOpen(false);
      setFormData({ companyId: '', name: '', title: '', email: '', phone: '', behavior: '' });
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mô-đun AI Lead Scoring</h1>
          <p className="text-slate-500 mt-1">Tự động chấm điểm và phân tích tiềm năng của người liên hệ</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger render={<Button onClick={handleOpenModal} className="bg-orange-500 hover:bg-orange-600 text-white" />}>
              <Plus className="w-4 h-4 mr-2" /> Thêm Liên hệ mới
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm Liên hệ & Đánh giá Tiềm năng</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Công ty Doanh nghiệp</label>
                  <select 
                    required
                    className="w-full border border-slate-300 rounded-md p-2 text-sm"
                    value={formData.companyId}
                    onChange={e => setFormData({...formData, companyId: e.target.value})}
                  >
                    <option value="">-- Chọn công ty --</option>
                    {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên liên hệ</label>
                    <input required type="text" className="w-full border border-slate-300 rounded-md p-2 text-sm"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Chức danh</label>
                    <input type="text" placeholder="Vd: Giám đốc Kỹ thuật" className="w-full border border-slate-300 rounded-md p-2 text-sm"
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" className="w-full border border-slate-300 rounded-md p-2 text-sm"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hành vi gần đây</label>
                    <select 
                      className="w-full border border-slate-300 rounded-md p-2 text-sm"
                      value={formData.behavior}
                      onChange={e => setFormData({...formData, behavior: e.target.value})}
                    >
                      <option value="">-- Chọn hành vi --</option>
                      <option value="Tải file bản vẽ">Tải file bản vẽ kỹ thuật (+50đ)</option>
                      <option value="Xem bảng giá">Xem bảng giá</option>
                      <option value="Gửi yêu cầu qua Email">Gửi email hỗ trợ</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                    {loading ? "Đang phân tích AI..." : "Lưu & Bắt đầu Phân tích"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {result && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-bold text-lg text-emerald-400">Kết quả phân tích từ AI cho {result.contact?.name}</h3>
            <span className="text-2xl font-black bg-white text-slate-900 px-4 py-1 rounded-full">
              Điểm: {result.contact?.score}
            </span>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50 relative z-10">
            <p className="text-slate-200 leading-relaxed">
              {result.aiAnalysis}
            </p>
          </div>
          <Button 
            variant="ghost" 
            className="mt-4 text-slate-400 hover:text-white" 
            onClick={() => setResult(null)}
          >
            Đóng
          </Button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Danh sách Liên hệ đã tính điểm</h2>
          
          <select 
            className="border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[200px]"
            value={filterCompanyId}
            onChange={(e) => setFilterCompanyId(e.target.value)}
          >
            <option value="">-- Lọc theo tất cả khách hàng --</option>
            {companies.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Tên / Chức danh</th>
                <th className="px-6 py-3 font-medium">Công ty</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Hành vi gần đây</th>
                <th className="px-6 py-3 font-medium">Điểm Lead Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.map((contact, i) => (
                <tr key={contact.id || i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{contact.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{contact.title}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{contact.companyName}</td>
                  <td className="px-6 py-4 text-slate-600">{contact.email}</td>
                  <td className="px-6 py-4">
                    {contact.behavior && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {contact.behavior}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                      {contact.score}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Chưa có dữ liệu liên hệ phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

