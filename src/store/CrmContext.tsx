import React, { createContext, useContext, useState, useEffect } from 'react';
import { Opportunity } from '../types';

interface CrmContextType {
  opportunities: Opportunity[];
  assets: any[];
  companies: any[];
  updateOpportunityStage: (id: string, newStage: Opportunity['stage']) => void;
  fetchDashboard: () => void;
  seedData: () => Promise<void>;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.opportunities) setOpportunities(data.opportunities);
      
      const resAssets = await fetch('/api/assets');
      const dataAssets = await resAssets.json();
      if (Array.isArray(dataAssets)) setAssets(dataAssets);

      const resAcc = await fetch('/api/accounts');
      const dataAcc = await resAcc.json();
      if (Array.isArray(dataAcc)) setCompanies(dataAcc);

    } catch (e) {
      console.error(e);
    }
  };

  const seedData = async () => {
    await fetch('/api/seed', { method: 'POST' });
    await fetchDashboard();
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const updateOpportunityStage = async (id: string, newStage: Opportunity['stage']) => {
    // Optimistic UI update
    setOpportunities(prev => 
      prev.map(opp => opp.id === id ? { ...opp, stage: newStage } : opp)
    );
    // API Call
    try {
      await fetch(`/api/opportunities/${id}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
    } catch (e) {
      console.error("Failed to update stage", e);
    }
  };

  return (
    <CrmContext.Provider value={{ opportunities, assets, companies, updateOpportunityStage, fetchDashboard, seedData }}>
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) throw new Error('useCrm must be used within a CrmProvider');
  return context;
};
