import React, { useEffect, useState } from 'react';
import { crmService, Lead } from '../services/crmService';
import PipelineStage from '../components/PipelineStage';
import { useNavigate, useLocation } from 'react-router-dom';

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stageFilter, setStageFilter] = useState<string>();
  const [form, setForm] = useState({ name: '', email: '' });
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
    ? leads.filter(l => l.status === stageFilter)
    : leads;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newLead = await crmService.createLead({ ...form, status: 'New' });
      setLeads([...leads, newLead]);
      setForm({ name: '', email: '' });
    } catch (error) {
      console.error('Failed to create lead', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await crmService.deleteLead(id);
      setLeads(leads.filter(l => l.id !== id));
    } catch (error) {
      console.error('Failed to delete lead', error);
    }
  };

  const handleEdit = async (lead: Lead) => {
    const name = prompt('Name', lead.name);
    if (!name) return;
    try {
      const updated = await crmService.updateLead(lead.id, { name });
      setLeads(leads.map(l => (l.id === lead.id ? updated : l)));
    } catch (error) {
      console.error('Failed to update lead', error);
    }
  };

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Leads</h1>
      <form onSubmit={handleSubmit} className="space-y-2 max-w-sm">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Add Lead
        </button>
      </form>
      <PipelineStage stages={stages} current={stageFilter} onStageClick={setStageFilter} />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{lead.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.email}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.status}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    className="text-blue-600"
                    onClick={() => navigate(`${basePath}/crm/interactions/${lead.id}`)}
                  >
                    Interactions
                  </button>
                  <button
                    className="text-green-600"
                    onClick={() => handleEdit(lead)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(lead.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsPage;
