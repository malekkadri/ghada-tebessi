import React, { useEffect, useState } from 'react';
import { crmService, Lead } from '../services/crmService';
import PipelineStage from '../components/PipelineStage';
import { useNavigate, useLocation } from 'react-router-dom';

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stageFilter, setStageFilter] = useState<string>();
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'New', notes: '' });
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', status: '', notes: '' });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  useEffect(() => {
    crmService
      .getLeads({ search, sortBy, order })
      .then(data => setLeads(data))
      .catch(err => console.error('Failed to load leads', err));
  }, [search, sortBy, order]);

  const stages = ['New', 'Contacted', 'Qualified', 'Lost', 'Won'];

  const filteredLeads = stageFilter
    ? leads.filter(l => l.status === stageFilter)
    : leads;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newLead = await crmService.createLead(form);
      setLeads([...leads, newLead]);
      setForm({ name: '', email: '', phone: '', status: 'New', notes: '' });
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

  const handleConvert = async (id: string) => {
    try {
      await crmService.convertLead(id);
      setLeads(leads.filter(l => l.id !== id));
      navigate(`${basePath}/crm/customers`);
    } catch (error) {
      console.error('Failed to convert lead', error);
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status || 'New',
      notes: lead.notes || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      const updated = await crmService.updateLead(editingLead.id, editForm);
      setLeads(leads.map(l => (l.id === editingLead.id ? updated : l)));
      setEditingLead(null);
    } catch (error) {
      console.error('Failed to update lead', error);
    }
  };

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Leads</h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder="Search leads"
          className="p-2 border rounded w-full sm:w-64"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="created_at">Created</option>
        </select>
        <select
          value={order}
          onChange={e => setOrder(e.target.value as 'asc' | 'desc')}
          className="p-2 border rounded"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
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
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-2 border rounded"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          {stages.map(stage => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Add Lead
        </button>
      </form>

      {editingLead && (
        <form onSubmit={handleEditSubmit} className="space-y-2 max-w-sm">
          <h2 className="text-xl font-semibold">Edit Lead</h2>
          <input
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
            placeholder="Name"
            className="w-full p-2 border rounded"
          />
          <input
            name="email"
            value={editForm.email}
            onChange={handleEditChange}
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          <input
            name="phone"
            value={editForm.phone}
            onChange={handleEditChange}
            placeholder="Phone"
            className="w-full p-2 border rounded"
          />
          <select
            name="status"
            value={editForm.status}
            onChange={handleEditChange}
            className="w-full p-2 border rounded"
          >
            {stages.map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <textarea
            name="notes"
            value={editForm.notes}
            onChange={handleEditChange}
            placeholder="Notes"
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            Save
          </button>
        </form>
      )}
      <PipelineStage stages={stages} current={stageFilter} onStageClick={setStageFilter} />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{lead.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.email}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.phone}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.status}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    className="text-blue-600"
                    onClick={() =>
                      navigate(
                        `${basePath}/crm/interactions/${lead.id}?type=lead`
                      )
                    }
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
                    className="text-purple-600"
                    onClick={() => handleConvert(lead.id)}
                  >
                    Convert
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
