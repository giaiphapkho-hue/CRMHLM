export interface Account {
  id: string;
  name: string;
  industry: 'Logistics' | 'F&B' | 'Manufacturing' | 'Other';
}

export interface Location {
  id: string;
  accountId: string;
  name: string;
  address: string;
}

export interface Contact {
  id: string;
  accountId: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  score: number; // Lead Score
  behavior?: string;
}

// Service Module (MRO) - Asset Passport
export interface Asset {
  id: string;
  siteId: string;
  serialNumber: string;
  capacity: string; 
  acceptanceDate: string; // ISO date
  nextMaintenanceDate: string; // ISO date
  drawingUrl?: string;
  type: string;
  status: 'Hoạt động' | 'Cần bảo trì' | 'Ngừng hoạt động' | string;
  site?: any;
  maintenanceRecords?: any[];
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  date: string;
  description: string;
  technician: string;
}

export type PipelineStage = 'Tìm kiếm' | 'Sàng lọc (BANT)' | 'Khám phá' | 'Giải pháp & Báo giá (CPQ)' | 'Đàm phán' | 'Đóng hợp đồng' | 'Bàn giao';

export const PIPELINE_STAGES: PipelineStage[] = [
  'Tìm kiếm',
  'Sàng lọc (BANT)',
  'Khám phá',
  'Giải pháp & Báo giá (CPQ)',
  'Đàm phán',
  'Đóng hợp đồng',
  'Bàn giao'
];

export interface Opportunity {
  id: string;
  companyId: string;
  title: string;
  value: number;
  stage: PipelineStage;
  closeDate: string;
  company?: any;
}
