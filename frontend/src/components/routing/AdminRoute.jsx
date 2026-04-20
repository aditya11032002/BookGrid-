import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // If not authenticated or not an admin, boot them to login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
