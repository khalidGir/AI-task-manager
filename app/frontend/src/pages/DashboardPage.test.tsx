import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  it('renders dashboard content correctly', () => {
    render(
      <Router>
        <DashboardPage />
      </Router>
    );

    expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/you are logged in/i)).toBeInTheDocument();
  });

  it('has correct heading level and styling', () => {
    render(
      <Router>
        <DashboardPage />
      </Router>
    );

    const heading = screen.getByRole('heading', { level: 1, name: /welcome to your dashboard/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-3xl');
    expect(heading).toHaveClass('font-bold');
    expect(heading).toHaveClass('text-white');
  });
});