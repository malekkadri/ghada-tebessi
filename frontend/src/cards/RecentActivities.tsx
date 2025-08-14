import { activityLogService } from '../services/api';
import { useState, useEffect } from 'react';
import { ActivityLog } from '../services/ActivityLog';

const RecentActivities = () => {
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await activityLogService.getRecentActivities();
        setRecentActivities(response.data);
      } catch (error) {
        console.error('Failed to fetch recent activities', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  if (loading) return <div>Loading recent activities...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Quick Overview
      </h4>
      <div className="space-y-3">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              activity.activityType.includes('success') ? 'bg-green-500' : 
              activity.activityType.includes('failed') ? 'bg-red-500' : 'bg-blue-500'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                {activity.activityType.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;