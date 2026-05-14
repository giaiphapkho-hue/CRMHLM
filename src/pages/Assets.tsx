import { useState } from 'react';
import { useCrm } from '../store/CrmContext';
import { format } from 'date-fns';
import { Wrench, FileText, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { Asset } from '../types';

export default function Assets() {
  const { assets } = useCrm();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const getFullAssetDetails = (asset: Asset) => {
    return asset;
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* List */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm shrink-0">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Cơ sở vật chất / Installed Base</h2>
          <p className="text-xs text-slate-500">Hệ thống kệ đã lắp đặt</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {assets.map(asset => {
            const isSelected = selectedAsset?.id === asset.id;
            return (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={cn(
                  "w-full text-left p-3 mb-2 rounded-lg transition-colors border",
                  isSelected 
                    ? "bg-orange-50 border-orange-200" 
                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-slate-800 text-sm">{asset.serialNumber}</span>
                  {asset.status === 'Cần bảo trì' ? (
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-slate-500">{asset.type}</div>
                <div className="text-xs text-slate-400 mt-1 truncate">{asset.site?.name}</div>
              </button>
            );
          })}
          {assets.length === 0 && (
            <p className="text-center text-slate-500 mt-8 text-sm">Chưa có dữ liệu. Vui lòng Seed DB.</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {selectedAsset ? (
          <>
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedAsset.serialNumber}</h2>
                <p className="text-slate-500">{getFullAssetDetails(selectedAsset).site?.company?.name} - {getFullAssetDetails(selectedAsset).site?.name}</p>
              </div>
              <span className={cn(
                "px-3 py-1 text-sm font-medium rounded-full",
                selectedAsset.status === 'Cần bảo trì' ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
              )}>
                {selectedAsset.status.toUpperCase()}
              </span>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Hộ chiếu thiết bị (Asset Passport)</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Loại kệ (Type)</p>
                  <p className="font-medium text-slate-800">{selectedAsset.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Tải trọng (Capacity)</p>
                  <p className="font-medium text-slate-800">{selectedAsset.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Ngày nghiệm thu</p>
                  <p className="font-medium text-slate-800">
                    {selectedAsset.acceptanceDate ? format(new Date(selectedAsset.acceptanceDate), 'dd/MM/yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Ngày bảo trì tiếp theo</p>
                  <p className="font-medium text-slate-800">
                    {selectedAsset.nextMaintenanceDate ? format(new Date(selectedAsset.nextMaintenanceDate), 'dd/MM/yyyy') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mb-10">
                <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  Xem bản vẽ kỹ thuật
                </button>
                <button className="flex items-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  <Wrench className="w-4 h-4 mr-2" />
                  Ghi nhận bảo trì
                </button>
              </div>

              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Lịch sử sửa chữa</h3>
              <div className="space-y-4">
                {(getFullAssetDetails(selectedAsset).maintenanceRecords || []).map(record => (
                  <div key={record.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-800">{format(new Date(record.date), 'dd/MM/yyyy')}</span>
                      <span className="text-xs text-slate-500">Kỹ thuật viên: {record.technician}</span>
                    </div>
                    <p className="text-sm text-slate-600">{record.description}</p>
                  </div>
                ))}
                {(getFullAssetDetails(selectedAsset).maintenanceRecords || []).length === 0 && (
                  <p className="text-sm text-slate-500 italic">Chưa có lịch sử bảo trì.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Layers className="w-16 h-16 mb-4 text-slate-200" />
            <p>Chọn một hệ thống kệ để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}
