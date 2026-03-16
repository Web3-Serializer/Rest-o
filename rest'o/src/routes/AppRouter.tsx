import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import { LoginPage } from '@/pages/login/LoginPage';
import { RegisterPage } from '@/pages/register/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { NotFoundPage } from '@/pages/common/NotFoundPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { MenusPage } from '@/pages/menus/MenusPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { ReservationsPage } from '@/pages/reservations/ReservationsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { IndexPage } from '@/pages/index/IndexPage';
import { PosPage } from '@/pages/pos/PosPage';
import { KitchenPage } from '@/pages/kitchen/KitchenPage';

interface AppRoute {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  publicOnly?: boolean;
  roles?: string[];
  employeeOnly?: boolean;
}

const routes: AppRoute[] = [
  { path: '/', element: <IndexPage />, publicOnly: false },
  { path: '/login', element: <LoginPage />, publicOnly: true },
  { path: '/register', element: <RegisterPage />, publicOnly: true },
  { path: '/dashboard', element: <DashboardPage />, protected: true },
  { path: '/menus', element: <MenusPage />, protected: true },
  { path: '/orders', element: <OrdersPage />, protected: true },
  { path: '/reservations', element: <ReservationsPage />, protected: true },
  { path: '/profile', element: <ProfilePage />, protected: true },
  { path: '/admin', element: <AdminPage />, protected: true, roles: ['admin', 'manager'] },
  { path: '/pos', element: <PosPage />, protected: true, roles: ['admin', 'manager', 'staff'] },
  { path: '/kitchen', element: <KitchenPage />, protected: true, roles: ['admin', 'manager', 'staff'] }
];

export const AppRouter = () => {
  const { user } = useAuth();

  const hasAccess = (route: AppRoute) => {
    if (!route.protected) return true;
    if (!user) return false;
    
    if (route.roles) {
      return route.roles.includes(user.role);
    }
    
    if (route.employeeOnly) {
      return ['admin', 'manager', 'staff'].includes(user.role);
    }
    
    return true;
  };

  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => {
          let element = route.element;

          if (route.protected) {
            element = (
              <ProtectedRoute 
                roles={route.roles} 
                employeeOnly={route.employeeOnly}
              >
                {hasAccess(route) ? route.element : <Navigate to="/dashboard" replace />}
              </ProtectedRoute>
            );
          } else if (route.publicOnly && user) {
            element = <Navigate to="/dashboard" replace />;
          }

          return <Route key={route.path} path={route.path} element={element} />;
        })}

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};