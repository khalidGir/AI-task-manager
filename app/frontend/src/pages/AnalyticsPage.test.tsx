import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AnalyticsPage from './AnalyticsPage';
import { useAuthStore } from '../store/auth.store';
import api from '../services/api';

// Mock the API service
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock react-router-dom's useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

// Mock Recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div>BarChart {children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>ResponsiveContainer {children}</div>,
}));

describe('AnalyticsPage', () => {
  beforeEach(() => {
    // Clear any previous auth state before each test
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setAuth('mockToken', { id: '123', email: 'test@example.com' });
    mockedUsedNavigate.mockClear();
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockedApi.get.mockResolvedValue({ data: {} });

    render(
      <Router>
        <AnalyticsPage />
      </Router>
    );

    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
  });

  it('fetches and displays analytics data', async () => {
    const mockAnalytics = {
      totalTasks: 10,
      completedTasks: 6,
      pendingTasks: 4,
      completedVsPendingRatio: 0.6,
      weeklyActivity: [
        { date: '2023-01-01', tasksCompleted: 2 },
        { date: '2023-01-02', tasksCompleted: 1 },
      ],
      aiRecommendations: ['Keep up the great work!', 'Try to complete more tasks.'],
    };
    mockedApi.get.mockResolvedValue({ data: mockAnalytics });

    render(
      <Router>
        <AnalyticsPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/total tasks/i)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText(/completed tasks/i)).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText(/pending tasks/i)).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    expect(screen.getByText(/60.00% completed/i)).toBeInTheDocument();
    expect(screen.getByText(/keep up the great work!/i)).toBeInTheDocument();
    expect(screen.getByText(/try to complete more tasks./i)).toBeInTheDocument();
  });

  it('handles API error', async () => {
    mockedApi.get.mockRejectedValue({ response: { data: { message: 'Failed to fetch analytics.' } } });

    render(
      <Router>
        <AnalyticsPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/error: failed to fetch analytics./i)).toBeInTheDocument();
    });
  });

  it('handles 401 error by clearing auth and navigating to login', async () => {
    mockedApi.get.mockRejectedValue({ response: { status: 401, data: { message: 'Unauthorized' } } });

    render(
      <Router>
        <AnalyticsPage />
      </Router>
    );

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('displays "no analytics data available" when response is empty', async () => {
    mockedApi.get.mockResolvedValue({ data: null });

    render(
      <Router>
        <AnalyticsPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/no analytics data available/i)).toBeInTheDocument();
    });
  });

  it('displays ai recommendations properly', async () => {
    const mockAnalytics = {
      totalTasks: 5,
      completedTasks: 3,
      pendingTasks: 2,
      completedVsPendingRatio: 0.6,
      weeklyActivity: [],
      aiRecommendations: [
        'Consider reviewing your task load; a high percentage of tasks are still pending.',
        'Maintain consistency! There were days this week with no tasks completed.',
        'Keep up the great work! Your task management looks efficient.',
      ],
    };
    mockedApi.get.mockResolvedValue({ data: mockAnalytics });

    render(
      <Router>
        <AnalyticsPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/consider reviewing your task load/i)).toBeInTheDocument();
      expect(screen.getByText(/maintain consistency!/i)).toBeInTheDocument();
      expect(screen.getByText(/keep up the great work!/i)).toBeInTheDocument();
    });
  });
});