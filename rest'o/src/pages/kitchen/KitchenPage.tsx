import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserLayout } from '@/components/layout/UserLayout';
import { orderAPI } from '@/services/api.service';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { ChefHat, Clock, CheckCircle, Package, Bell, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { EventSourcePolyfill } from 'event-source-polyfill';
import type { MessageEvent } from 'event-source-polyfill';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  menu: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  tableNumber?: string;
  customerName?: string;
  notes?: string;
  createdAt: string;
}

export const KitchenPage = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { token } = useAuth();

  useEffect(() => {
    fetchOrders();
    
    if (!token) return;

    const eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_API_URL}/orders/kitchen-stream`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      }
    );

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('SSE Connected');
    };

    eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'order_created') {
        setOrders(prev => [data.order, ...prev]);
        playNotificationSound();
        toast.success(t('kitchen.newOrder'), {
          description: `Commande #${data.order.orderNumber}`,
          duration: 3000,
        });
      } else if (data.type === 'order_updated') {
        setOrders(prev => prev.map(order => 
          order._id === data.order._id ? data.order : order
        ));
      } else if (data.type === 'order_deleted') {
        setOrders(prev => prev.filter(order => order._id !== data.orderId));
      }
      
      setLastUpdate(new Date());
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.error('SSE Error');
    };

    return () => {
      eventSource.close();
    };
  }, [token, t]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getAll({ status: 'pending,preparing' });
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      toast.error(t('kitchen.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZTA0PVK3n77BdGAg+ltzy0n0pBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsIGGS57OihUBELTKXh8bllHAU2kNXzzn4qBSh8yvHajzsI');
    audio.play().catch(() => {});
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(t('kitchen.statusUpdated'));
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error(t('kitchen.updateError'));
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
    return diff;
  };

  const getUrgencyLevel = (elapsed: number, status: string) => {
    if (status === 'pending') {
      if (elapsed > 10) return 'high';
      if (elapsed > 5) return 'medium';
      return 'low';
    } else {
      if (elapsed > 20) return 'high';
      if (elapsed > 15) return 'medium';
      return 'low';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 border-red-500';
      case 'medium': return 'bg-orange-500 border-orange-500';
      default: return 'bg-blue-500 border-blue-500';
    }
  };

  const getProgressValue = (elapsed: number, status: string) => {
    const maxTime = status === 'pending' ? 15 : 25;
    return Math.min((elapsed / maxTime) * 100, 100);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending').sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const preparingOrders = orders.filter(o => o.status === 'preparing').sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (loading) return <LoadingSpinner />;

  return (
    <UserLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br ">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('kitchen.title')}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <span>{t('kitchen.activeOrders')}: <strong>{orders.length}</strong></span>
                    <span className="hidden sm:inline">•</span>
                    <span>{t('kitchen.pending')}: <strong className="text-yellow-600">{pendingOrders.length}</strong></span>
                    <span className="hidden sm:inline">•</span>
                    <span>{t('kitchen.preparing')}: <strong className="text-blue-600">{preparingOrders.length}</strong></span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-3 bg-gray-50 rounded-lg px-3 sm:px-4 py-2 border flex-1 sm:flex-none">
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">
                      {isConnected ? t('kitchen.connected') : t('kitchen.disconnected')}
                    </span>
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-gray-300" />
                  <div className="text-right sm:text-left">
                    <p className="text-xs text-gray-500">{t('kitchen.lastUpdate')}</p>
                    <p className="text-xs sm:text-sm font-mono font-semibold">{lastUpdate.toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchOrders}
                  className="border-gray-300 text-xs sm:text-sm"
                >
                  {t('kitchen.refresh')}
                </Button>
              </div>
            </div>
          </div>
        </div>


        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
                <div className="w-2 sm:w-3 h-6 sm:h-8 rounded-full" />
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t('kitchen.pending')}</h2>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{t('kitchen.waitingPreparation')}</p>
                  </div>
                </div>
                <Badge variant="secondary" className=" text-yellow-800 text-sm sm:text-lg px-2 sm:px-3 py-1">
                  {pendingOrders.length}
                </Badge>
              </div>

              <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 sm:pr-2">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg font-medium">{t('kitchen.noPending')}</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">{t('kitchen.noPendingDesc')}</p>
                  </div>
                ) : (
                  pendingOrders.map(order => {
                    const elapsed = getElapsedTime(order.createdAt);
                    const urgency = getUrgencyLevel(elapsed, order.status);
                    const progress = getProgressValue(elapsed, order.status);
                    
                    return (
                      <Card key={order._id} className="bg-white border-l-4 border-l-yellow-500 shadow-sm sm:shadow-lg hover:shadow-md sm:hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                              <CardTitle className="flex items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                                  <span className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                                    #{order.orderNumber}
                                  </span>
                                </div>
                                {urgency === 'high' && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs animate-pulse flex-shrink-0">
                                    <AlertTriangle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                    {t('kitchen.urgent')}
                                  </Badge>
                                )}
                              </CardTitle>
                              
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                {order.tableNumber && (
                                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                    {t('kitchen.table')} {order.tableNumber}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className={`font-semibold ${urgency === 'high' ? 'text-red-600' : urgency === 'medium' ? 'text-orange-600' : 'text-gray-600'}`}>
                                    {elapsed} {t('kitchen.minutes')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getUrgencyColor(urgency)} animate-pulse flex-shrink-0 ml-2`} />
                          </div>
                          
                          <Progress value={progress} className={`h-1 sm:h-2 mt-2 ${
                            urgency === 'high' ? 'bg-red-100' : 
                            urgency === 'medium' ? 'bg-orange-100' : 'bg-yellow-100'
                          }`} />
                        </CardHeader>
                        
                        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg border text-sm">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                  <Badge variant="secondary" className="bg-white text-gray-700 border shadow-sm text-xs">
                                    {item.quantity}x
                                  </Badge>
                                  <span className="font-semibold text-gray-900 truncate">{item.menu.name}</span>
                                </div>
                                <span className="text-xs sm:text-sm text-gray-500 font-medium flex-shrink-0 ml-2">
                                  {item.price.toFixed(2)}€
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-xs sm:text-sm text-orange-800">
                                <span className="font-semibold">📝 {t('kitchen.notes')}:</span> {order.notes}
                              </p>
                            </div>
                          )}

                          <Button
                            onClick={() => updateOrderStatus(order._id, 'preparing')}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 sm:py-3 h-auto text-sm sm:text-base"
                          >
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                            {t('kitchen.startPreparing')}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
                <div className="w-2 sm:w-3 h-6 sm:h-8 rounded-full" />
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t('kitchen.preparing')}</h2>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{t('kitchen.inProgress')}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-blue-800 text-sm sm:text-lg px-2 sm:px-3 py-1">
                  {preparingOrders.length}
                </Badge>
              </div>

              <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 sm:pr-2">
                {preparingOrders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg font-medium">{t('kitchen.noPreparing')}</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">{t('kitchen.noPreparingDesc')}</p>
                  </div>
                ) : (
                  preparingOrders.map(order => {
                    const elapsed = getElapsedTime(order.createdAt);
                    const urgency = getUrgencyLevel(elapsed, order.status);
                    const progress = getProgressValue(elapsed, order.status);
                    
                    return (
                      <Card key={order._id} className={`bg-white border-l-4 shadow-sm sm:shadow-lg hover:shadow-md sm:hover:shadow-xl transition-all duration-300 ${
                        urgency === 'high' ? 'border-l-red-500' :
                        urgency === 'medium' ? 'border-l-orange-500' : 'border-l-blue-500'
                      }`}>
                        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                              <CardTitle className="flex items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                                  <span className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                                    #{order.orderNumber}
                                  </span>
                                </div>
                                {urgency === 'high' && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs animate-pulse flex-shrink-0">
                                    <AlertTriangle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                    {t('kitchen.delayed')}
                                  </Badge>
                                )}
                              </CardTitle>
                              
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                {order.tableNumber && (
                                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                    {t('kitchen.table')} {order.tableNumber}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                  <span className={`font-semibold ${urgency === 'high' ? 'text-red-600' : urgency === 'medium' ? 'text-orange-600' : 'text-blue-600'}`}>
                                    {elapsed} {t('kitchen.minutes')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getUrgencyColor(urgency)} animate-pulse flex-shrink-0 ml-2`} />
                          </div>
                          
                          <Progress value={progress} className={`h-1 sm:h-2 mt-2 ${
                            urgency === 'high' ? 'bg-red-100' : 
                            urgency === 'medium' ? 'bg-orange-100' : 'bg-blue-100'
                          }`} />
                        </CardHeader>
                        
                        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg border text-sm">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                  <Badge variant="secondary" className="bg-white text-gray-700 border shadow-sm text-xs">
                                    {item.quantity}x
                                  </Badge>
                                  <span className="font-semibold text-gray-900 truncate">{item.menu.name}</span>
                                </div>
                                <span className="text-xs sm:text-sm text-gray-500 font-medium flex-shrink-0 ml-2">
                                  {item.price.toFixed(2)}€
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-xs sm:text-sm text-orange-800">
                                <span className="font-semibold">📝 {t('kitchen.notes')}:</span> {order.notes}
                              </p>
                            </div>
                          )}

                          <Button
                            onClick={() => updateOrderStatus(order._id, 'ready')}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 sm:py-3 h-auto text-sm sm:text-base"
                          >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                            {t('kitchen.markReady')}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};