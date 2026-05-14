import { Code } from 'lucide-react';

const scriptContent = `
/**
 * HLM CRM - Google Apps Script Backend (Bước 3)
 * Đoạn mã này kết nối Web App hoặc Form với Google Sheets.
 */

// 1. Khai báo ID của Google Sheet
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Thay thế ID của Sheet tại đây

function getSpreadsheet() {
  return SpreadsheetApp.openById(SHEET_ID);
}

// 2. Ghi Lead mới (API: POST)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'ADD_LEAD') {
      return addLead(data.payload);
    } else if (action === 'UPDATE_PIPELINE') {
      return updatePipeline(data.payload);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addLead(payload) {
  const sheet = getSpreadsheet().getSheetByName('Leads');
  // payload: { name, email, company, jobTitle, industry, behavior }
  
  // Tính điểm Lead Scoring
  let score = 0;
  if (payload.industry === 'Logistics' || payload.industry === 'F&B') score += 20;
  if (payload.jobTitle && (payload.jobTitle.includes('Giám đốc Kỹ thuật') || payload.jobTitle.includes('Nhà máy'))) score += 25;
  if (payload.behavior === 'Download Drawing') score += 50;

  sheet.appendRow([
    new Date(), // Timestamp
    payload.name,
    payload.email,
    payload.company,
    payload.industry,
    payload.jobTitle,
    score,
    'Mới' // Status
  ]);

  return ContentService.createTextOutput(JSON.stringify({ status: 'success', score: score }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 3. Cập nhật trạng thái Pipeline
function updatePipeline(payload) {
  const sheet = getSpreadsheet().getSheetByName('Pipeline');
  // payload: { oppId, newStage }
  
  const data = sheet.getDataRange().getValues();
  // Bỏ qua dòng tiêu đề
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.oppId) {
      sheet.getRange(i + 1, 5).setValue(payload.newStage); // Giả sử cột 5 là Stage
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Opportunity not found' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 4. Tra cứu lịch sử bảo trì kệ kho (API: GET)
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'GET_MAINTENANCE') {
    const assetId = e.parameter.assetId;
    const sheet = getSpreadsheet().getSheetByName('MaintenanceHistory');
    const data = sheet.getDataRange().getValues();
    
    // Header format: [AssetId, Date, Description, Technician]
    let history = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === assetId) {
        history.push({
          date: data[i][1],
          description: data[i][2],
          technician: data[i][3]
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: history }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export default function Docs() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Google Apps Script Backend</h1>
        <p className="text-slate-600">
          Theo yêu cầu Bước 3: Đoạn mã kết nối CSDL 0 đồng sử dụng Google Sheets. Để sử dụng, hãy copy mã bên dưới vào Google Apps Script 
          (Tiện ích mở rộng &gt; Apps Script trong Google Sheets) và triển khai (Deploy) dưới dạng Web App.
        </p>
      </div>

      <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-[#404040]">
          <Code className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-sm font-medium text-slate-300">Code.gs</span>
          <div className="ml-auto flex gap-2">
            <button 
              onClick={() => navigator.clipboard.writeText(scriptContent)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors"
            >
              Copy Code
            </button>
          </div>
        </div>
        <div className="p-6 overflow-x-auto">
          <pre className="text-sm font-mono text-[#d4d4d4] leading-relaxed">
            {scriptContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
