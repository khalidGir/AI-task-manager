import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPage from './LoginPage';
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

describe('LoginPage', () => {
  beforeEach(() => {
    // Clear any previous auth state before each test
    useAuthStore.getState().clearAuth();
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /don't have an account\? sign up/i })).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    const errorMessage = 'Invalid credentials';
    mockedApi.post.mockRejectedValue({ response: { data: { message: errorMessage } } });

    render(
      <Router>
        <LoginPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(mockedUsedNavigate).not.toHaveBeenCalled();
  });

  it('navigates to dashboard on successful login', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    const mockToken = 'mockAccessToken';
    mockedApi.post.mockResolvedValue({ data: { id: mockUser.id, email: mockUser.email, accessToken: mockToken } });

    render(
      <Router>
        <LoginPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: mockUser.email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe(mockToken);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});