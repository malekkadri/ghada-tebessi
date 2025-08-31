import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InteractionForm from '../components/InteractionForm';
import { crmService, Interaction } from '../services/crmService';

const InteractionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [interactions, setInteractions] = useState<Interaction[]>([]);

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

  const handleEdit = async (interaction: Interaction) => {
    const note = prompt('Note', interaction.notes);
    if (!note) return;
    try {
      const updated = await crmService.updateInteraction(interaction.id, { note });
      setInteractions(interactions.map(i => (i.id === interaction.id ? updated : i)));
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Note</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {interactions.map(interaction => (
              <tr key={interaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{interaction.notes}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {interaction.createdAt ? new Date(interaction.createdAt).toLocaleString() : ''}
                </td>
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
