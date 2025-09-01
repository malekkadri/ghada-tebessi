import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import taskService, { Task } from '../services/taskService';

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso as string;
  }
}

const CRMStatsPage: React.FC = () => {
  const [leadCount, setLeadCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [reminders, setReminders] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const [leads, customers, tasks] = await Promise.all([
          crmService.getLeads(),
          crmService.getCustomers(),
          taskService.getTasks({ status: 'pending' })
        ]);
        if (!ignore) {
          setLeadCount(leads.length);
          setCustomerCount(customers.length);
          setReminders(tasks);
        }
      } catch (err) {
        console.error('Failed to load CRM stats', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-6">CRM Stats</h1>
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Totals</h2>
          <p className="text-gray-700 dark:text-gray-200">Leads: {leadCount}</p>
          <p className="text-gray-700 dark:text-gray-200">Customers: {customerCount}</p>
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
    </div>
  );
};

export default CRMStatsPage;

