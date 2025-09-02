import React, { useEffect, useState } from 'react';
import { crmService, CrmHistory } from '../services/crmService';

const CRMHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<CrmHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    crmService.getHistory()
      .then(setHistory)
      .catch(() => setError('Failed to load history'));
  }, []);

  if (error) return <div className="p-4">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Track History</h1>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Action</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Entity</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map(h => (
              <tr key={h.id}>
                <td className="px-4 py-2 text-sm text-gray-700">{h.action}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{`${h.entityType} #${h.entityId}`}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{new Date(h.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CRMHistoryPage;
