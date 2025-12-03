import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/auth.store';

// Mock react-router-dom's useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('Navbar', () => {
  beforeEach(() => {
    // Clear any previous auth state before each test
    useAuthStore.getState().clearAuth();
    mockedUsedNavigate.mockClear();
    jest.clearAllMocks();
  });

  it('renders navbar with navigation links when user is logged in', () => {
    // Set up auth state with a user
    useAuthStore.getState().setAuth('mockToken', { id: '123', email: 'test@example.com' });

    render(
      <Router>
        <Navbar />
      </Router>
    );

    expect(screen.getByText(/ai task manager/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome, test@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls clearAuth and navigates to login on logout', () => {
    // Set up auth state with a user
    useAuthStore.getState().setAuth('mockToken', { id: '123', email: 'test@example.com' });

    render(
      <Router>
        <Navbar />
      </Router>
    );

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders navigation links that navigate correctly', () => {
    // Set up auth state with a user
    useAuthStore.getState().setAuth('mockToken', { id: '123', email: 'test@example.com' });

    render(
      <Router>
        <Navbar />
      </Router>
    );

    // Check that navigation links exist
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /timeline/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
  });
});