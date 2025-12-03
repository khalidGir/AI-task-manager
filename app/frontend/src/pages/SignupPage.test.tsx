import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SignupPage from './SignupPage';
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

describe('SignupPage', () => {
  beforeEach(() => {
    // Clear any previous auth state before each test
    useAuthStore.getState().clearAuth();
    jest.clearAllMocks();
  });

  it('renders signup form correctly', () => {
    render(
      <Router>
        <SignupPage />
      </Router>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /already have an account\? login/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(
      <Router>
        <SignupPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'differentpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(mockedUsedNavigate).not.toHaveBeenCalled();
  });

  it('shows error message on failed signup', async () => {
    const errorMessage = 'Email already in use';
    mockedApi.post.mockRejectedValue({ response: { data: { message: errorMessage } } });

    render(
      <Router>
        <SignupPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(mockedUsedNavigate).not.toHaveBeenCalled();
  });

  it('navigates to dashboard on successful signup', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    const mockToken = 'mockAccessToken';
    mockedApi.post.mockResolvedValue({ data: { id: mockUser.id, email: mockUser.email, accessToken: mockToken } });

    render(
      <Router>
        <SignupPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: mockUser.email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe(mockToken);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});