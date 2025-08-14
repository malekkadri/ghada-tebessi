import React, { useState } from 'react';
import { crmService } from '../services/crmService';

interface InteractionFormProps {
  customerId: string;
  onSaved?: () => void;
}

const InteractionForm: React.FC<InteractionFormProps> = ({ customerId, onSaved }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crmService.createInteraction(customerId, { note });
      setNote('');
      onSaved?.();
    } catch (error) {
      console.error('Failed to save interaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full p-2 border rounded"
        rows={4}
        placeholder="Add notes about the interaction..."
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
