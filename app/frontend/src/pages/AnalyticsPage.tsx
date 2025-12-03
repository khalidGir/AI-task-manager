import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/auth.store';
// Recharts for charting, need to install: npm install recharts --workspace=frontend
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completedVsPendingRatio: number;
  weeklyActivity: { date: string; tasksCompleted: number; }[];
  aiRecommendations: string[];
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/analytics/overview');
        setAnalyticsData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch analytics.');
        if (err.response?.status === 401) {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [clearAuth]);

  if (loading) return <div className="text-center text-white p-4">Loading analytics...</div>;
  if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  if (!analyticsData) return <div className="text-center text-gray-400 p-4">No analytics data available.</div>;

  const weeklyChartData = analyticsData.weeklyActivity.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
    'Tasks Completed': item.tasksCompleted
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-2">Total Tasks</h2>
          <p className="text-4xl text-blue-400">{analyticsData.totalTasks}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-2">Completed Tasks</h2>
          <p className="text-4xl text-green-400">{analyticsData.completedTasks}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-2">Pending Tasks</h2>
          <p className="text-4xl text-red-400">{analyticsData.pendingTasks}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Completed vs. Pending Ratio</h2>
        <p className="text-2xl text-yellow-400">
          {(analyticsData.completedVsPendingRatio * 100).toFixed(2)}% Completed
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Weekly Activity Heatmap</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={weeklyChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis dataKey="name" stroke="#cbd5e0" />
              <YAxis stroke="#cbd5e0" />
              <Tooltip cursor={{ fill: '#4a5568', opacity: 0 }} />
              <Legend />
              <Bar dataKey="Tasks Completed" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-white mb-4">AI Recommendations</h2>
        {analyticsData.aiRecommendations.length > 0 ? (
          <ul className="list-disc list-inside text-gray-300">
            {analyticsData.aiRecommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No specific AI recommendations at this time.</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;