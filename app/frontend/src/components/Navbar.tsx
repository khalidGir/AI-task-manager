import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">AI Task Manager</div>
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
          <Link to="/timeline" className="hover:text-blue-400">Timeline</Link>
          <Link to="/analytics" className="hover:text-blue-400">Analytics</Link>
          {user && <span className="text-sm">Welcome, {user.email}</span>}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;