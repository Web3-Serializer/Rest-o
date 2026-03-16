import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingBag, 
  Calendar, 
  User,
  Settings,
  Calculator,
  ChefHat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles?: string[];
  employeeOnly?: boolean;
}

export const Sidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/menus', icon: Utensils, label: t('sidebar.menus') },
    { to: '/orders', icon: ShoppingBag, label: t('sidebar.orders') },
    { to: '/reservations', icon: Calendar, label: t('sidebar.reservations') },
    { to: '/profile', icon: User, label: t('sidebar.profile') },
    
    { 
      to: '/admin', 
      icon: Settings, 
      label: t('sidebar.admin'),
      roles: ['admin', 'manager'] 
    },
    { 
      to: '/pos', 
      icon: Calculator, 
      label: t('sidebar.pos'),
      roles: ['admin', 'manager', 'staff'] 
    },
    { 
      to: '/kitchen', 
      icon: ChefHat, 
      label: t('sidebar.kitchen'),
      roles: ['admin', 'manager', 'staff'] 
    }
  ];

  const hasAccess = (item: NavItem) => {
    if (!user) return false;
    
    if (item.roles) {
      return item.roles.includes(user.role);
    }
    
    if (item.employeeOnly) {
      return ['admin', 'manager', 'staff'].includes(user.role);
    }
    
    return true;
  };

  const filteredNavItems = navItems.filter(hasAccess);

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col w-64 border-r bg-muted/40 min-h-[calc(100vh-4rem)]">
        <nav className="flex flex-col gap-2 p-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <Button
                key={item.to}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'justify-start gap-3 transition-all duration-200',
                  isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                )}
                asChild
              >
                <Link to={item.to}>
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex justify-around bg-background/90 backdrop-blur px-6 py-2 rounded-t-full shadow-lg lg:hidden w-[90%] max-w-md">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center text-sm transition-all duration-200 mt-2',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
            </Link>
          );
        })}
      </nav>
    </>
  );
};