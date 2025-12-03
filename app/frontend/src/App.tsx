import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TimelinePage from './pages/TimelinePage'; // Import new page
import AnalyticsPage from './pages/AnalyticsPage'; // Import new page
import Navbar from './components/Navbar';

const ProtectedRoutes = () => {
  const { accessToken } = useAuthStore();
  return accessToken ? (
    <>
      <Navbar />
      <div className="flex-grow"> {/* Added flex-grow to push content below navbar */}
        <Outlet />
      </div>
    </>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen flex flex-col"> {/* Added flex flex-col */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/timeline" element={<TimelinePage />} /> {/* New protected route */}
            <Route path="/analytics" element={<AnalyticsPage />} /> {/* New protected route */}
            {/* Add other protected routes here */}
          </Route>

          {/* Default redirect based on auth status */}
          <Route path="*" element={<Navigate to={useAuthStore.getState().accessToken ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
