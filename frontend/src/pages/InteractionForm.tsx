import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InteractionForm from '../components/InteractionForm';
import { crmService, Interaction } from '../services/crmService';

const InteractionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [editForm, setEditForm] = useState({ type: '', date: '', notes: '' });

  const loadInteractions = () => {
    if (!id) return;
    crmService
      .getInteractions(id)
      .then(data => setInteractions(data))
      .catch(err => console.error('Failed to load interactions', err));
  };

  useEffect(() => {
    loadInteractions();
  }, [id]);

  const handleEdit = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setEditForm({
      type: interaction.type,
      date: interaction.date || '',
      notes: interaction.notes || '',
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInteraction) return;
    try {
      const updated = await crmService.updateInteraction(editingInteraction.id, editForm);
      setInteractions(
        interactions.map(i => (i.id === editingInteraction.id ? updated : i))
      );
      setEditingInteraction(null);
    } catch (error) {
      console.error('Failed to update interaction', error);
    }
  };

  const handleDelete = async (interactionId: string) => {
    try {
      await crmService.deleteInteraction(interactionId);
      setInteractions(interactions.filter(i => i.id !== interactionId));
    } catch (error) {
      console.error('Failed to delete interaction', error);
    }
  };

  if (!id) {
    return <div>No customer selected</div>;
  }

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Interactions</h1>
      <InteractionForm customerId={id} onSaved={loadInteractions} />
      {editingInteraction && (
        <form onSubmit={handleEditSubmit} className="space-y-2 max-w-sm">
          <h2 className="text-xl font-semibold">Edit Interaction</h2>
          <input
            name="type"
            value={editForm.type}
            onChange={handleEditChange}
            className="w-full p-2 border rounded"
            placeholder="Type"
          />
          <input
            type="datetime-local"
            name="date"
            value={editForm.date}
            onChange={handleEditChange}
            className="w-full p-2 border rounded"
          />
          <textarea
            name="notes"
            value={editForm.notes}
            onChange={handleEditChange}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Notes"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            Save
          </button>
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {interactions.map(interaction => (
              <tr key={interaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{interaction.type}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {interaction.date ? new Date(interaction.date).toLocaleString() : ''}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{interaction.notes}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    className="text-green-600"
                    onClick={() => handleEdit(interaction)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(interaction.id)}
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

export default InteractionsPage;
