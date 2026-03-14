import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ requiredRole }) {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // 1. Not Authenticated? -> Login Page
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated but Data not loaded yet? -> Wait (Spinner)
  // This prevents race conditions where user exists but role is undefined
  if (!userData) {
     return <LoadingSpinner fullScreen />;
  }

  // 3. Wrong Role? -> Home Page
  // Note: We perform this check only if a requiredRole is specified
  if (requiredRole && userData.role !== requiredRole) {
    console.warn(`Access Denied: User is ${userData.role}, required ${requiredRole}`);
    return <Navigate to="/" replace />;
  }

  // 4. Authorized -> Render content
  return <Outlet />;
}