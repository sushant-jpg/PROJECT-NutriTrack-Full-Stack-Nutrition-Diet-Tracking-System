import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute() {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner fullPage label="Checking administrator access…" />;
  if (!user || role !== 'admin') return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return <Outlet />;
}

