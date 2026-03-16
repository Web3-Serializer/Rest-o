import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { statsAPI } from '@/services/api.service';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { Utensils, ShoppingBag, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const COLORS = ['#2563eb', '#22c55e', '#facc15', '#ef4444', '#8b5cf6'];

export const ManagerDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalMenus: 0,
    totalOrders: 0,
    totalReservations: 0,
    totalRevenue: 0,
    orderStatus: {},
    monthlyRevenue: [],
    popularMenus: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsAPI.getAll();
        if (res.success) {
          setStats({
            totalMenus: res.data.totalMenus || 0,
            totalOrders: res.data.totalOrders || 0,
            totalReservations: res.data.totalReservations || 0,
            totalRevenue: res.data.totalRevenue || 0,
            orderStatus: res.data.orderStatus || {},
            monthlyRevenue: res.data.monthlyRevenue || [],
            popularMenus: res.data.popularMenus || []
          });
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

  const orderStatusData = Object.entries(stats.orderStatus).map(([status, count]) => ({
    name: t(`orderStatuses.${status}`),
    value: count
  }));

  const revenueData = stats.monthlyRevenue?.map((month: any) => ({
    name: month.month,
    revenue: month.revenue
  })) || [];

  const topMenus = stats.popularMenus?.slice(0, 5) || [];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.roles.manager.title')}</h1>
          <p className="text-gray-600 mt-2">{t('dashboard.roles.manager.description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.stats.totalRevenue')} 
          value={`€${stats.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard 
          title={t('dashboard.stats.orders')} 
          value={stats.totalOrders.toLocaleString('fr-FR')}
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <StatCard 
          title={t('dashboard.stats.reservations')} 
          value={stats.totalReservations.toLocaleString('fr-FR')}
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard 
          title={t('dashboard.stats.menus')} 
          value={stats.totalMenus.toLocaleString('fr-FR')}
          icon={<Utensils className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('dashboard.revenueTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`€${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`, t('dashboard.revenue')]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              {t('dashboard.orderStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {orderStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            {t('dashboard.popularMenus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMenus.map((menu: any, index: number) => (
              <div key={menu._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{menu.name}</p>
                    <p className="text-sm text-gray-500">{menu.quantity} {t('dashboard.sold')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">€{menu.revenue?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-green-600">{menu.orders || 0} {t('dashboard.orders')}</p>
                </div>
              </div>
            ))}
            {topMenus.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('dashboard.noData')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className="text-gray-400">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);