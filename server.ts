import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI, Type } from "@google/genai";

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ======== API ROUTES ======== //

  app.get("/api/dashboard", async (req, res) => {
    try {
      const opps = await prisma.opportunity.findMany();
      const assets = await prisma.asset.findMany();
      res.json({ opportunities: opps, assets });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/accounts", async (req, res) => {
    const companies = await prisma.company.findMany({
      include: { sites: true, contacts: true, opportunities: true }
    });
    res.json(companies);
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const { companyId, name, title, email, phone, behavior } = req.body;
      
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (!company) {
         return res.status(404).json({ error: "Company not found" });
      }

      // Step 1: Base rule-based scoring
      let baseScore = 0;
      if (company.industry === 'Logistics' || company.industry === 'F&B') baseScore += 20;
      if (title && (title.includes('Giám đốc Kỹ thuật') || title.includes('Nhà máy'))) baseScore += 25;
      if (behavior === 'Tải file bản vẽ') baseScore += 50;

      // Step 2: AI Lead Scoring Analysis
      let aiAnalysis = "Basic lead analysis.";
      try {
        const promptInfo = `
        Evaluate this B2B prospect for industrial racking systems (Hoa Long Mechanical).
        Company Industry: ${company.industry}
        Contact Name: ${name}
        Job Title: ${title}
        Recent Behavior: ${behavior}
        Base Calculated Score: ${baseScore} (out of 100).
        Provide a short reason (max 2 sentences, in Vietnamese) explaining why this prospect represents a high, medium, or low priority opportunity.`;
        
        if (process.env.GEMINI_API_KEY) {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: promptInfo,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reasoning: { type: Type.STRING, description: "Lý do ưu tiên bằng tiếng Việt" }
                },
                required: ["reasoning"]
              }
            }
          });
          const result = JSON.parse(response.text.trim());
          aiAnalysis = result.reasoning;
        }
      } catch (e) {
        console.warn("AI Scoring skipped or failed", e);
      }

      const contact = await prisma.contact.create({
        data: {
          companyId,
          name,
          title, email, phone, behavior,
          score: baseScore,
        }
      });
      res.json({ contact, aiAnalysis });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/pipeline", async (req, res) => {
    const pipeline = await prisma.opportunity.findMany({
      include: { company: true }
    });
    res.json(pipeline);
  });

  app.put("/api/opportunities/:id/stage", async (req, res) => {
    try {
      const { stage } = req.body;
      const id = req.params.id;
      const opp = await prisma.opportunity.update({
        where: { id },
        data: { stage }
      });
      res.json(opp);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/assets", async (req, res) => {
    const assets = await prisma.asset.findMany({
      include: { site: { include: { company: true } }, maintenanceRecords: true }
    });
    res.json(assets);
  });

  app.post("/api/seed", async (req, res) => {
    try {
      // Seed initial data
      const comp1 = await prisma.company.create({
        data: { name: 'Kho Van Express', industry: 'Logistics' }
      });
      const comp2 = await prisma.company.create({
        data: { name: 'Fresh Foods Co', industry: 'F&B' }
      });

      const site1 = await prisma.site.create({
        data: { companyId: comp1.id, name: 'Kho Binh Duong', address: '123 VSIP, Binh Duong' }
      });
      const site2 = await prisma.site.create({
        data: { companyId: comp2.id, name: 'Kho Lanh Long An', address: 'KCN Tan An, Long An' }
      });

      await prisma.contact.createMany({
        data: [
          { companyId: comp1.id, name: 'Nguyen Van A', title: 'Giám đốc Vận hành', email: 'a.nguyen@khovan.ex', phone: '0901234567', score: 45 },
          { companyId: comp2.id, name: 'Tran Thi B', title: 'Giám đốc Kỹ thuật', email: 'b.tran@freshfoods.co', phone: '0987654321', score: 95, behavior: 'Tải file bản vẽ' },
        ]
      });

      await prisma.opportunity.createMany({
        data: [
          { companyId: comp1.id, title: 'Mở rộng Kho Bình Dương Phase 2', value: 1500000000, stage: 'Khám phá', closeDate: new Date('2026-08-01') },
          { companyId: comp2.id, title: 'Lắp kệ Double Deep Kho Lạnh mới', value: 850000000, stage: 'Đàm phán', closeDate: new Date('2026-07-01') },
          { companyId: comp1.id, title: 'Dự án Selective Kho Cũ', value: 500000000, stage: 'Đóng hợp đồng', closeDate: new Date('2026-05-10') }
        ]
      });

      await prisma.asset.create({
        data: {
          siteId: site1.id,
          serialNumber: 'HLM-RK-2023-001',
          type: 'Selective Pallet Rack',
          capacity: '2000kg/pallet',
          acceptanceDate: new Date('2025-06-01'),
          nextMaintenanceDate: new Date('2026-06-01'), // Due soon
          status: 'Hoạt động'
        }
      });
      await prisma.asset.create({
        data: {
          siteId: site2.id,
          serialNumber: 'HLM-DI-2022-045',
          type: 'Drive-in Rack',
          capacity: '1500kg/pallet',
          acceptanceDate: new Date('2024-05-01'),
          nextMaintenanceDate: new Date('2025-05-01'), // Overdue
          status: 'Cần bảo trì'
        }
      });

      res.json({ status: "Seeded data successfully!" });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
