import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CrmProvider } from './store/CrmContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Assets from './pages/Assets';
import Docs from './pages/Docs';
import Accounts from './pages/Accounts';
import LeadScoring from './pages/LeadScoring';

export default function App() {
  return (
    <CrmProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="assets" element={<Assets />} />
            <Route path="lead-scoring" element={<LeadScoring />} />
            <Route path="docs" element={<Docs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CrmProvider>
  );
}
