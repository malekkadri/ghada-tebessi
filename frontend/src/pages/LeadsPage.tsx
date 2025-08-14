import React, { useEffect, useState } from 'react';
import { crmService, Lead } from '../services/crmService';
import CustomerCard from '../components/CustomerCard';
import PipelineStage from '../components/PipelineStage';
import { useNavigate, useLocation } from 'react-router-dom';

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stageFilter, setStageFilter] = useState<string>();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  useEffect(() => {
    crmService
      .getLeads()
      .then(data => setLeads(data))
      .catch(err => console.error('Failed to load leads', err));
  }, []);

  const stages = ['New', 'Contacted', 'Qualified', 'Lost', 'Won'];

  const filteredLeads = stageFilter
    ? leads.filter(l => l.stage === stageFilter)
    : leads;

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Leads</h1>
      <PipelineStage stages={stages} current={stageFilter} onStageClick={setStageFilter} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map(lead => (
          <CustomerCard
            key={lead.id}
            customer={lead}
            onClick={() => navigate(`${basePath}/crm/interactions/${lead.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default LeadsPage;
