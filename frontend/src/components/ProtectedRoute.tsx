import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from './ui/loadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  employeeOnly?: boolean;
}

export const ProtectedRoute = ({ children, roles, employeeOnly }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (employeeOnly && !['admin', 'manager', 'staff'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};