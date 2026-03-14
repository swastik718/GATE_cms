import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ requiredRole }) {
  const { currentUser, userData, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (currentUser && userData) {
        // Check if user has the required role
        const userRole = userData.role || currentUser.role;
        setIsAuthorized(userRole === requiredRole);
      } else {
        setIsAuthorized(false);
      }
    }
  }, [currentUser, userData, loading, requiredRole]);

  if (loading || isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}