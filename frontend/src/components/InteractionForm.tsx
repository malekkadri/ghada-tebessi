import React, { useState } from 'react';
import { crmService } from '../services/crmService';

interface InteractionFormProps {
  entityId: string;
  entityType: 'customers' | 'leads';
  onSaved?: () => void;
}

const InteractionForm: React.FC<InteractionFormProps> = ({ entityId, entityType, onSaved }) => {
  const [form, setForm] = useState({ type: '', date: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crmService.createInteraction(entityType, entityId, form);
      setForm({ type: '', date: '', notes: '' });
      onSaved?.();
    } catch (error) {
      console.error('Failed to save interaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="type"
        value={form.type}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Type"
      />
      <input
        type="datetime-local"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <textarea
        name="notes"
        value={form.notes}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        rows={4}
        placeholder="Notes"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Interaction'}
      </button>
    </form>
  );
};

export default InteractionForm;
