import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { orderAPI, reservationAPI } from '@/services/api.service';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { toast } from 'sonner';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';

export const UserDashboard = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const ordersRes = await orderAPI.getMyOrders();
        const reservationsRes = await reservationAPI.getMyReservations();

        setOrders(ordersRes.data.orders || []);
        setReservations(reservationsRes.data.reservations || []);
      } catch (err: any) {
        toast.error(err?.message || 'Error loading your data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = [
    { name: t('dashboard.stats.pendingOrders'), value: orders.filter(o => o.status === 'pending').length },
    { name: t('dashboard.stats.activeReservations'), value: reservations.filter(r => r.status === 'confirmed').length },
    { name: t('dashboard.stats.completedOrders'), value: orders.filter(o => o.status === 'delivered').length },
  ];

  return (
    <div className="space-y-6 p-3">
      <h1 className="text-2xl font-bold">{t('dashboard.roles.user.title')}</h1>
      <p>{t('dashboard.roles.user.description')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title={t('dashboard.stats.pendingOrders')} value={stats[0].value} />
        <StatCard title={t('dashboard.stats.activeReservations')} value={stats[1].value} />
        <StatCard title={t('dashboard.stats.completedOrders')} value={stats[2].value} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.activityOverview')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#000000ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.stats.orders')}</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">{t('dashboard.noOrders')}</p>
            ) : (
              <ul className="space-y-2">
                {orders.slice(0, 5).map((order: any) => (
                  <li key={order._id} className="border rounded-lg p-2">
                    <p className="font-semibold">#{order.orderNumber}</p>
                    <p className="text-sm flex items-center gap-2">
                      {t('dashboard.stats.status')}:
                      <Badge
                        variant="outline"
                        className={
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : order.status === 'preparing'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : order.status === 'ready'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : ''
                        }
                      >
                        {t(`orderStatuses.${order.status}`)}
                      </Badge>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.stats.reservations')}</CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <p className="text-muted-foreground">{t('dashboard.noReservations')}</p>
            ) : (
              <ul className="space-y-2">
                {reservations.slice(0, 5).map((res: any) => (
                  <li key={res._id} className="border rounded-lg p-2">
                    <p className="font-semibold">{res.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(res.date).toLocaleDateString()} - {res.time}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      {t('dashboard.stats.status')}:
                      <Badge
                        variant="outline"
                        className={
                          res.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : res.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : res.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : res.status === 'completed'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : ''
                        }
                      >
                        {t(`reservationStatuses.${res.status}`)}
                      </Badge>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: number | string }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-lg text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);
