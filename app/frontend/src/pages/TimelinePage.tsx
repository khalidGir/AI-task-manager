import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/auth.store';

interface Event {
  id: string;
  action: string;
  metadata: any;
  timestamp: string;
}

const TimelinePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('all');
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/events', { params: { filter } });
        setEvents(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch events.');
        if (err.response?.status === 401) {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [filter, clearAuth]);

  if (loading) return <div className="text-center text-white p-4">Loading timeline...</div>;
  if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Activity Timeline</h1>

      <div className="mb-4">
        <label htmlFor="filter" className="text-white mr-2">Filter:</label>
        <select
          id="filter"
          className="bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'today' | 'week' | 'all')}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
        </select>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-400">No activity events found.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <p className="text-lg font-semibold text-blue-400">{event.action}</p>
              <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
              {event.metadata && (
                <pre className="text-xs text-gray-400 mt-2 bg-gray-700 p-2 rounded overflow-x-auto">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelinePage;