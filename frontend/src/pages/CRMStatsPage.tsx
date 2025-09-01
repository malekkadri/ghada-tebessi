import React, { useCallback, useEffect, useState } from 'react';
import { crmService, CRMStats } from '../services/crmService';
import taskService, { Task } from '../services/taskService';
import CRMCharts from '../atoms/Charts/CRMCharts';

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso as string;
  }
}

const CRMStatsPage: React.FC = () => {
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [reminders, setReminders] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, tasks] = await Promise.all([
        crmService.getStats(),
        taskService.getTasks({ status: 'pending' })
      ]);
      setStats(stats);
      setReminders(tasks);
    } catch (err) {
      console.error('Failed to load CRM stats', err);
      setError('Failed to load CRM stats. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-6">CRM Stats</h1>
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Totals</h2>
          <p className="text-gray-700 dark:text-gray-200">Leads: {stats.leadCount}</p>
          <p className="text-gray-700 dark:text-gray-200">Customers: {stats.customerCount}</p>
        </div>
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Reminders</h2>
          {reminders.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No reminders</p>
          ) : (
            <ul className="space-y-2">
              {reminders.map(r => (
                <li key={r.id} className="flex justify-between">
                  <span>{r.title}</span>
                  <span className="text-sm text-gray-500">{formatDate(r.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <CRMCharts
        weeklyLeadCreation={stats.weeklyLeadCreation}
        conversionRate={stats.conversionRate}
        interactionsPerCustomer={stats.interactionsPerCustomer}
      />
    </div>
  );
};

export default CRMStatsPage;

