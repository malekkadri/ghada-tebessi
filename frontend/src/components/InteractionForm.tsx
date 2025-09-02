import React, { useState } from 'react';
import { crmService } from '../services/crmService';

interface InteractionFormProps {
  entityId: string;
  entityType: 'customers' | 'leads';
  onSaved?: () => void;
}

const InteractionForm: React.FC<InteractionFormProps> = ({
  entityId,
  entityType,
  onSaved,
}) => {
  const [form, setForm] = useState({ type: '', date: '', notes: '' });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crmService.createInteraction(entityType, entityId, {
        ...form,
        file: file || undefined,
      });
      setForm({ type: '', date: '', notes: '' });
      setFile(null);
      onSaved?.();
    } catch (error) {
      console.error('Failed to save interaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-800">New Interaction</h2>

      {/* Type */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Type
        </label>
        <input
          id="type"
          name="type"
          value={form.type}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g. Call, Meeting"
          required
        />
      </div>

      {/* Date */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Date & Time
        </label>
        <input
          type="datetime-local"
          id="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Add extra details..."
        />
      </div>

      {/* File Upload */}
      <div>
        <label
          htmlFor="file"
          className="block text-sm font-medium text-gray-700"
        >
          Attachment (optional)
        </label>
        <input
          type="file"
          id="file"
          name="file"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-1 text-xs text-gray-500">Selected: {file.name}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Interaction'}
        </button>
      </div>
    </form>
  );
};

export default InteractionForm;
