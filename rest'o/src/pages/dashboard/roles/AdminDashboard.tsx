import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { statsAPI } from '@/services/api.service';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { Users, Utensils, ShoppingBag, Calendar, DollarSign, TrendingUp, Activity, Package } from 'lucide-react';

const COLORS = ['#2563eb', '#22c55e', '#facc15', '#ef4444', '#8b5cf6', '#06b6d4'];

interface StatCardProps {
  title: string;
  currentValue: number;
  previousValue?: number;
  icon: React.ReactNode;
}

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: 0,
    menus: 0,
    orders: 0,
    reservations: 0,
    totalRevenue: 0,
    previousUsers: 0,
    previousOrders: 0,
    previousReservations: 0,
    previousTotalRevenue: 0,
    monthlyRevenue: [],
    orderStatus: {},
    userGrowth: [],
    popularMenus: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsAPI.getAll();
        const s = res.data;

        setStats({
          users: s.totalUsers || 0,
          menus: s.totalMenus || 0,
          orders: s.totalOrders || 0,
          reservations: s.totalReservations || 0,
          totalRevenue: s.totalRevenue || 0,
          previousUsers: s.previousPeriod?.users || 0,
          previousOrders: s.previousPeriod?.orders || 0,
          previousReservations: s.previousPeriod?.reservations || 0,
          previousTotalRevenue: s.previousPeriod?.totalRevenue || 0,
          monthlyRevenue: s.monthlyRevenue || [],
          orderStatus: s.orderStatus || {},
          userGrowth: s.userGrowth || [],
          popularMenus: s.popularMenus || []
        });
      } catch (err: any) {
        toast.error(err?.message || 'Error loading stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const orderStatusData = Object.entries(stats.orderStatus).map(([status, count]) => ({
    name: t(`orderStatuses.${status}`),
    value: count,
    status
  }));

  const revenueGrowth = stats.monthlyRevenue?.map((month: any) => ({
    name: month.month,
    revenue: month.revenue,
    orders: month.orders
  })) || [];

  const userGrowthData = stats.userGrowth?.map((growth: any) => ({
    month: growth.month,
    users: growth.count
  })) || [];

  const topMenus = stats.popularMenus?.slice(0, 5) || [];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.roles.admin.title')}</h1>
          <p className="text-gray-600 mt-2">{t('dashboard.roles.admin.description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       <StatCard
          title={t('dashboard.stats.totalRevenue')}
          currentValue={stats.totalRevenue}
          previousValue={stats.previousTotalRevenue}
          icon={<DollarSign className="w-5 h-5" />}
        />

        <StatCard
          title={t('dashboard.stats.users')}
          currentValue={stats.users}
          previousValue={stats.previousUsers}
          icon={<Users className="w-5 h-5" />}
        />

        <StatCard
          title={t('dashboard.stats.orders')}
          currentValue={stats.orders}
          previousValue={stats.previousOrders}
          icon={<ShoppingBag className="w-5 h-5" />}
        />

        <StatCard
          title={t('dashboard.stats.reservations')}
          currentValue={stats.reservations}
          previousValue={stats.previousReservations}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('dashboard.revenueTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`€${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`, t('dashboard.revenue')]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('dashboard.userGrowth')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t('dashboard.popularMenus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMenus.map((menu: any, index: number) => (
                <div key={menu._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{menu.name}</p>
                      <p className="text-sm text-gray-500">{menu.orders} {t('dashboard.orders')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{menu.revenue?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-green-600">{menu.quantity || 0} {t('dashboard.sold')}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              {t('dashboard.dailyOrders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center py-8">
              {stats.orders > 0 ? Math.round(stats.orders / 30) : 0}
              <p className="text-sm font-normal text-gray-500 mt-1">{t('dashboard.perDay')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('dashboard.avgReservations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center py-8">
              {stats.reservations > 0 ? Math.round(stats.reservations / 30) : 0}
              <p className="text-sm font-normal text-gray-500 mt-1">{t('dashboard.perDay')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {t('dashboard.avgOrderValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center py-8">
              €{stats.orders > 0 ? (stats.totalRevenue / stats.orders).toFixed(2) : '0.00'}
              <p className="text-sm font-normal text-gray-500 mt-1">{t('dashboard.perOrder')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


const StatCard = ({ title, currentValue, previousValue, icon }: StatCardProps) => {
  const trend = previousValue !== undefined
    ? currentValue > previousValue
      ? 'up'
      : currentValue < previousValue
        ? 'down'
        : 'neutral'
    : null;

  const percentageChange =
    previousValue !== undefined && previousValue !== 0
      ? Math.round(((currentValue - previousValue) / previousValue) * 100)
      : null;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{currentValue}</div>
        {trend && trend !== 'neutral' && percentageChange !== null && (
          <div
            className={`flex items-center text-xs ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? '↗' : '↘'} {Math.abs(percentageChange)}%{' '}
            {trend === 'up' ? 'increase' : 'decrease'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};