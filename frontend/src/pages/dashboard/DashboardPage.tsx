import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

import { UserDashboard } from './roles/UserDashboard';
import { AdminDashboard } from './roles/AdminDashboard';
import { ManagerDashboard } from './roles/ManagerDashboard';
import { StaffDashboard } from './roles/StaffDashboard';
import { UserLayout } from '@/components/layout/UserLayout';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('errors.unauthorized')}</p>
      </div>
    );

  const dashboards: Record<string, React.ReactNode> = {
    admin: <AdminDashboard />,
    manager: <ManagerDashboard />,
    staff: <StaffDashboard />,
    user: <UserDashboard />,
  };

  return <UserLayout>{dashboards[user.role] || <UserDashboard />}</UserLayout>;
};
