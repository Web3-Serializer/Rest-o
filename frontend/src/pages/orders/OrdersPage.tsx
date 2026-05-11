import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserLayout } from '@/components/layout/UserLayout';
import { orderAPI } from '@/services/api.service';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { ShoppingBag, Search, Filter, ChevronDown, ChevronUp, Eye, Trash2, Clock, CheckCircle, XCircle, Package, Truck, Utensils } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'orderStatuses.pending' },
  preparing: { icon: Package, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'orderStatuses.preparing' },
  ready: { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200', label: 'orderStatuses.ready' },
  delivered: { icon: Truck, color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'orderStatuses.delivered' },
  cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'orderStatuses.cancelled' }
};

export const OrdersPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const isEmployee = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
       const res = isEmployee
        ? await orderAPI.getAll()
        : await orderAPI.getMyOrders();
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      toast.error(t("orders.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order =>
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      order.tableNumber?.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Order];
      let bValue: any = b[filters.sortBy as keyof Order];

      if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (filters.sortBy === 'totalAmount') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, search, filters]);

  const clearFilters = () => {
    setFilters({
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearch('');
  };

  const hasActiveFilters = filters.status !== 'all' || 
    filters.sortBy !== 'createdAt' || 
    filters.sortOrder !== 'desc' || 
    search;

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete?._id) return;
    try {
      await orderAPI.delete(orderToDelete._id);
      setOrders(prev => prev.filter(o => o._id !== orderToDelete._id));
      toast.success(t('orders.deleteSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('orders.deleteError'));
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => 
        o._id === orderId ? { ...o, status: newStatus as Order['status'] } : o
      ));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null);
      }
      toast.success(t('orders.statusUpdateSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('orders.statusUpdateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: Order['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} border flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {t(config.label)}
      </Badge>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <UserLayout>
      <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">

        <h1 className="text-2xl font-bold">{t('orders.pageTitle')}</h1>
        <p>{t('orders.pageDescription')}</p>

        <div className="flex flex-col gap-3">

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder={t('orders.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{t('orders.filters')}</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {hasActiveFilters && (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter">{t('orders.statusFilter')}</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('orders.allStatus')}</SelectItem>
                    <SelectItem value="pending">{t('orderStatuses.pending')}</SelectItem>
                    <SelectItem value="preparing">{t('orderStatuses.preparing')}</SelectItem>
                    <SelectItem value="ready">{t('orderStatuses.ready')}</SelectItem>
                    <SelectItem value="delivered">{t('orderStatuses.delivered')}</SelectItem>
                    <SelectItem value="cancelled">{t('orderStatuses.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-by">{t('orders.sortBy')}</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger id="sort-by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">{t('orders.sortByDate')}</SelectItem>
                    <SelectItem value="totalAmount">{t('orders.sortByAmount')}</SelectItem>
                    <SelectItem value="status">{t('orders.sortByStatus')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-order">{t('orders.sortOrder')}</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger id="sort-order">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">{t('orders.ascending')}</SelectItem>
                    <SelectItem value="desc">{t('orders.descending')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                {t('orders.showing')} {filteredOrders.length} {t('orders.of')} {orders.length} {t('orders.orders')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full sm:w-auto"
              >
                {t('orders.clearFilters')}
              </Button>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">{t('orders.noOrders')}</h3>
            <p className="text-gray-600">{t('orders.noOrdersDescription')}</p>
             <Link to="/menus">
                <Button className="mt-4">
                    <Utensils className="w-4 h-4 mr-2" />
                    {t('orders.startFirstOrder')}
                </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{t('orders.date')}:</span> {formatDate(order.createdAt)}
                      </div>
                      {order.tableNumber && (
                        <div>
                          <span className="font-medium">{t('orders.table')}:</span> {order.tableNumber}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">{t('orders.items')}:</span> {order.items.length}
                      </div>

                      {isEmployee && (
                        <div>
                          <span className="font-medium">{t('orders.customerName')}:</span> {order.customerName}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">{t('orders.total')}:</span> {order.totalAmount.toFixed(2)}€
                      </div>
                      {isEmployee && (
                        <div className="sm:col-span-2">
                          <span className="font-medium">{t('orders.createdBy')}:</span> {order.createdBy.name} ({order.createdBy.email})
                        </div>
                      )}

                    </div>

                    {order.notes && (
                      <div className="text-sm text-gray-600 border-l-2 border-gray-200 pl-2">
                        <span className="font-medium">{t('orders.notes')}:</span> {order.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('orders.view')}</span>
                    </Button>

                    {isEmployee && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order._id, value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t('orderStatuses.pending')}</SelectItem>
                          <SelectItem value="preparing">{t('orderStatuses.preparing')}</SelectItem>
                          <SelectItem value="ready">{t('orderStatuses.ready')}</SelectItem>
                          <SelectItem value="delivered">{t('orderStatuses.delivered')}</SelectItem>
                          <SelectItem value="cancelled">{t('orderStatuses.cancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {isAdminOrManager && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(order)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5" />
                <DialogTitle>{t('orders.orderDetails')}</DialogTitle>
              </div>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <Label className="text-gray-600">{t('orders.orderNumber')}</Label>
                    <p className="font-semibold">#{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">{t('orders.status')}</Label>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">{t('orders.date')}</Label>
                    <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  {selectedOrder.tableNumber && (
                    <div>
                      <Label className="text-gray-600">{t('orders.table')}</Label>
                      <p className="font-semibold">{selectedOrder.tableNumber}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold">{t('orders.items')}</Label>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold">{item.menu.name}</p>
                        <p className="text-sm text-gray-600">{item.price.toFixed(2)}€ × {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{(item.price * item.quantity).toFixed(2)}€</p>
                    </div>
                  ))}
                </div>

                {selectedOrder.notes && (
                  <div className="space-y-2">
                    <Label className="text-gray-600">{t('orders.notes')}</Label>
                    <p className="p-3 bg-gray-50 rounded-lg border">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-semibold">{t('orders.total')}</span>
                  <span className="text-2xl font-bold text-green-600">{selectedOrder.totalAmount.toFixed(2)}€</span>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 border-t">
              <Button onClick={() => setIsDetailModalOpen(false)} className="w-full">
                {t('orders.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <Trash2 className="w-5 h-5" />
                <DialogTitle>{t('orders.confirmDeleteTitle')}</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                {t('orders.confirmDeleteDescription')} <strong>#{orderToDelete?.orderNumber}</strong>?
                <br />
                <span className="text-red-600 font-medium mt-2 block">
                  {t('orders.deleteWarning')}
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1"
              >
                {t('orders.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('orders.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};