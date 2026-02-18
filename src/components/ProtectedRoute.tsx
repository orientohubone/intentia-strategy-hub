import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from './DashboardLayout';
import { Skeleton } from './ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = location.pathname + location.search;
      navigate(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <Skeleton className="h-28 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return user ? <>{children}</> : null;
}
