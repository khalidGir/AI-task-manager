import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import TimelinePage from './TimelinePage';
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

describe('TimelinePage', () => {
  beforeEach(() => {
    // Clear any previous auth state before each test
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setAuth('mockToken', { id: '123', email: 'test@example.com' });
    mockedUsedNavigate.mockClear();
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockedApi.get.mockResolvedValue({ data: [] });

    render(
      <Router>
        <TimelinePage />
      </Router>
    );

    expect(screen.getByText(/loading timeline/i)).toBeInTheDocument();
  });

  it('fetches and displays events', async () => {
    const mockEvents = [
      {
        id: '1',
        action: 'task.created',
        metadata: { taskId: '123', taskTitle: 'Test Task' },
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        action: 'user.signedIn',
        metadata: { userEmail: 'test@example.com' },
        timestamp: new Date().toISOString(),
      }
    ];
    mockedApi.get.mockResolvedValue({ data: mockEvents });

    render(
      <Router>
        <TimelinePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/task.created/i)).toBeInTheDocument();
      expect(screen.getByText(/user.signedIn/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/test task/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('handles API error', async () => {
    mockedApi.get.mockRejectedValue({ response: { data: { message: 'Failed to fetch events.' } } });

    render(
      <Router>
        <TimelinePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/error: failed to fetch events./i)).toBeInTheDocument();
    });
  });

  it('handles 401 error by clearing auth and navigating to login', async () => {
    mockedApi.get.mockRejectedValue({ response: { status: 401, data: { message: 'Unauthorized' } } });

    render(
      <Router>
        <TimelinePage />
      </Router>
    );

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('applies filter when changed', async () => {
    const mockEvents = [
      {
        id: '1',
        action: 'task.completed',
        metadata: { taskId: '123' },
        timestamp: new Date().toISOString(),
      }
    ];
    mockedApi.get.mockResolvedValue({ data: mockEvents });

    render(
      <Router>
        <TimelinePage />
      </Router>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/task.completed/i)).toBeInTheDocument();
    });

    // Change filter to 'today'
    const filterSelect = screen.getByLabelText(/filter:/i);
    fireEvent.change(filterSelect, { target: { value: 'today' } });

    // Verify API was called with correct filter parameter
    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/events', { params: { filter: 'today' } });
    });
  });

  it('displays message when no events exist', async () => {
    mockedApi.get.mockResolvedValue({ data: [] });

    render(
      <Router>
        <TimelinePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/no activity events found/i)).toBeInTheDocument();
    });
  });
});