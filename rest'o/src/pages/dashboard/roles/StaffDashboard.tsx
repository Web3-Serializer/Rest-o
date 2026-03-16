import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { statsAPI } from '@/services/api.service';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { Clock, Package, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';

const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'];

export const StaffDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    activeReservations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsAPI.getAll();
        if (res.success) {
          setStats(res.data);
        } else {
          toast.error(res.message || t('errors.network'));
        }
      } catch (err: any) {
        toast.error(err?.message || t('errors.server'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const orderData = [
    { name: t('dashboard.stats.pendingOrders'), value: stats.pendingOrders, status: 'pending' },
    { name: t('dashboard.stats.preparingOrders'), value: stats.preparingOrders, status: 'preparing' },
    { name: t('dashboard.stats.readyOrders'), value: stats.readyOrders, status: 'ready' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.roles.staff.title')}</h1>
          <p className="text-gray-600 mt-2">{t('dashboard.roles.staff.description')}</p>
        </div>
      </div>

      {stats.pendingOrders > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              {t('dashboard.attentionNeeded')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {t('dashboard.pendingOrdersAlert', { count: stats.pendingOrders })}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.stats.pendingOrders')} 
          value={stats.pendingOrders}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard 
          title={t('dashboard.stats.preparingOrders')} 
          value={stats.preparingOrders}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard 
          title={t('dashboard.stats.readyOrders')} 
          value={stats.readyOrders}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard 
          title={t('dashboard.stats.activeReservations')} 
          value={stats.activeReservations}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t('dashboard.orderDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {orderData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              {t('dashboard.orderOverview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode}) => {
  const { t } = useTranslation();

  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-gray-500 mt-1">
          {value === 1 ? t('dashboard.item') : t('dashboard.items')}
        </div>
      </CardContent>
    </Card>
  );
};