import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserLayout } from '@/components/layout/UserLayout';
import { reservationAPI } from '@/services/api.service';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { Calendar, Search, Filter, ChevronDown, ChevronUp, Eye, Trash2, Clock, CheckCircle, XCircle, Users, User, Plus } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Reservation {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateReservationForm {
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  numberOfGuests: number;
  specialRequests: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'reservationStatuses.pending' },
  confirmed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'reservationStatuses.confirmed' },
  completed: { icon: User, color: 'bg-green-100 text-green-800 border-green-200', label: 'reservationStatuses.completed' },
  cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'reservationStatuses.cancelled' }
};

export const ReservationsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [createForm, setCreateForm] = useState<CreateReservationForm>({
    customerName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    numberOfGuests: 2,
    specialRequests: ''
  });

  const isEmployee = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = isEmployee
        ? await reservationAPI.getAll()
        : await reservationAPI.getMyReservations();
      setReservations(res.data.reservations || res.data);
    } catch (err) {
      console.error('Failed to fetch reservations', err);
      toast.error(t("reservations.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = useMemo(() => {
    let filtered = reservations.filter(reservation =>
      reservation.customerName.toLowerCase().includes(search.toLowerCase()) ||
      reservation.email.toLowerCase().includes(search.toLowerCase()) ||
      reservation.phone.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.status !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === filters.status);
    }

    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Reservation];
      let bValue: any = b[filters.sortBy as keyof Reservation];

      if (filters.sortBy === 'date' || filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (filters.sortBy === 'numberOfGuests') {
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
  }, [reservations, search, filters]);

  const clearFilters = () => {
    setFilters({
      status: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setSearch('');
  };

  const hasActiveFilters = filters.status !== 'all' || 
    filters.sortBy !== 'date' || 
    filters.sortOrder !== 'desc' || 
    search;

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete?._id) return;
    try {
      await reservationAPI.delete(reservationToDelete._id);
      setReservations(prev => prev.filter(r => r._id !== reservationToDelete._id));
      toast.success(t('reservations.deleteSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('reservations.deleteError'));
    } finally {
      setIsDeleteModalOpen(false);
      setReservationToDelete(null);
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await reservationAPI.update(reservationId, { status: newStatus });
      setReservations(prev => prev.map(r => 
        r._id === reservationId ? { ...r, status: newStatus as Reservation['status'] } : r
      ));
      if (selectedReservation?._id === reservationId) {
        setSelectedReservation(prev => prev ? { ...prev, status: newStatus as Reservation['status'] } : null);
      }
      toast.success(t('reservations.statusUpdateSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('reservations.statusUpdateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateReservation = async () => {
    setIsCreating(true);
    try {
      if (!createForm.customerName || !createForm.email || !createForm.phone || !createForm.date || !createForm.time) {
        toast.error(t('reservations.fillRequiredFields'));
        return;
      }

      const reservationData = {
        customerName: createForm.customerName,
        email: createForm.email,
        phone: createForm.phone,
        date: createForm.date,
        time: createForm.time,
        numberOfGuests: createForm.numberOfGuests,
        specialRequests: createForm.specialRequests || undefined
      };

      const response = await reservationAPI.create(reservationData);
      const newReservation = response.data.reservation || response.data;
      
      setReservations(prev => [newReservation, ...prev]);
      toast.success(t('reservations.createSuccess'));
      setIsCreateModalOpen(false);
      resetCreateForm();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t('reservations.createError'));
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      customerName: user?.name || '',
      email: user?.email || '',
      phone: '',
      date: '',
      time: '',
      numberOfGuests: 2,
      specialRequests: ''
    });
  };

  const handleCreateModalOpen = () => {
    setCreateForm(prev => ({
      ...prev,
      customerName: user?.name || prev.customerName,
      email: user?.email || prev.email
    }));
    setIsCreateModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: Reservation['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} border flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {t(config.label)}
      </Badge>
    );
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 11; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  }, []);

  const today = new Date().toISOString().split('T')[0];

  if (loading) return <LoadingSpinner />;

  return (
    <UserLayout>
      <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        <h1 className="text-2xl font-bold">{t('reservations.pageTitle')}</h1>
        <p>{t('reservations.pageDescription')}</p>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button onClick={handleCreateModalOpen} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('reservations.createReservation')}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder={t('reservations.searchPlaceholder')}
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
              <span className="hidden sm:inline">{t('reservations.filters')}</span>
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
                <Label htmlFor="status-filter">{t('reservations.statusFilter')}</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('reservations.allStatus')}</SelectItem>
                    <SelectItem value="pending">{t('reservationStatuses.pending')}</SelectItem>
                    <SelectItem value="confirmed">{t('reservationStatuses.confirmed')}</SelectItem>
                    <SelectItem value="completed">{t('reservationStatuses.completed')}</SelectItem>
                    <SelectItem value="cancelled">{t('reservationStatuses.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-by">{t('reservations.sortBy')}</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger id="sort-by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">{t('reservations.sortByDate')}</SelectItem>
                    <SelectItem value="numberOfGuests">{t('reservations.sortByGuests')}</SelectItem>
                    <SelectItem value="status">{t('reservations.sortByStatus')}</SelectItem>
                    <SelectItem value="createdAt">{t('reservations.sortByCreated')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-order">{t('reservations.sortOrder')}</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger id="sort-order">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">{t('reservations.ascending')}</SelectItem>
                    <SelectItem value="desc">{t('reservations.descending')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                {t('reservations.showing')} {filteredReservations.length} {t('reservations.of')} {reservations.length} {t('reservations.reservations')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full sm:w-auto"
              >
                {t('reservations.clearFilters')}
              </Button>
            </div>
          </div>
        )}

        {filteredReservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">{t('reservations.noReservations')}</h3>
            <p className="text-gray-600">{t('reservations.noReservationsDesc')}</p>
            <Button onClick={handleCreateModalOpen} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              {t('reservations.createFirstReservation')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg">{reservation.customerName}</h3>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{t('reservations.date')}:</span> {formatDate(reservation.date)}
                      </div>
                      <div>
                        <span className="font-medium">{t('reservations.time')}:</span> {reservation.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{t('reservations.guests')}:</span> {reservation.numberOfGuests}
                      </div>
                      
                      {isEmployee && (
                        <>
                          <div className="sm:col-span-2">
                            <span className="font-medium">{t('reservations.email')}:</span> {reservation.email}
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-medium">{t('reservations.phone')}:</span> {reservation.phone}
                          </div>
                        </>
                      )}
                    </div>

                    {reservation.specialRequests && (
                      <div className="text-sm text-gray-600 border-l-2 border-gray-200 pl-2">
                        <span className="font-medium">{t('reservations.specialRequests')}:</span> {reservation.specialRequests}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReservation(reservation)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('reservations.view')}</span>
                    </Button>

                    {isEmployee && reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                      <Select
                        value={reservation.status}
                        onValueChange={(value) => handleStatusChange(reservation._id, value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t('reservationStatuses.pending')}</SelectItem>
                          <SelectItem value="confirmed">{t('reservationStatuses.confirmed')}</SelectItem>
                          <SelectItem value="completed">{t('reservationStatuses.completed')}</SelectItem>
                          <SelectItem value="cancelled">{t('reservationStatuses.cancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {isAdminOrManager && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(reservation)}
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

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-5 h-5" />
                <DialogTitle>{t('reservations.createReservation')}</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="required">
                    {t('reservations.customerName')}
                  </Label>
                  <Input
                    id="customerName"
                    value={createForm.customerName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder={t('reservations.customerNamePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="required">
                    {t('reservations.email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('reservations.emailPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="required">
                    {t('reservations.phone')}
                  </Label>
                  <Input
                    id="phone"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('reservations.phonePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfGuests">
                    {t('reservations.guests')}
                  </Label>
                  <Select
                    value={createForm.numberOfGuests.toString()}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, numberOfGuests: parseInt(value) }))}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {t('reservations.guests')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="required">
                    {t('reservations.date')}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={createForm.date}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, date: e.target.value }))}
                    min={today}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="required">
                    {t('reservations.time')}
                  </Label>
                  <Select
                    value={createForm.time}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, time: value }))}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={t('reservations.selectTime')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

      
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">
                  {t('reservations.specialRequests')}
                </Label>
                <Textarea
                  id="specialRequests"
                  value={createForm.specialRequests}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder={t('reservations.specialRequestsPlaceholder')}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetCreateForm();
                }}
                className="flex-1"
              >
                {t('reservations.cancel')}
              </Button>
              <Button
                onClick={handleCreateReservation}
                disabled={isCreating || !createForm.customerName || !createForm.email || !createForm.phone || !createForm.date || !createForm.time}
                className="flex-1"
              >
                {isCreating ? t('reservations.creating') : t('reservations.createReservation')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <DialogTitle>{t('reservations.reservationDetails')}</DialogTitle>
              </div>
            </DialogHeader>

            {selectedReservation && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <Label className="text-gray-600">{t('reservations.customerName')}</Label>
                    <p className="font-semibold">{selectedReservation.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">{t('reservations.status')}</Label>
                    <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">{t('reservations.date')}</Label>
                    <p className="font-semibold">{formatDate(selectedReservation.date)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">{t('reservations.time')}</Label>
                    <p className="font-semibold">{selectedReservation.time}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">{t('reservations.guests')}</Label>
                    <p className="font-semibold">{selectedReservation.numberOfGuests}</p>
                  </div>
                

                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold">{t('reservations.contactInfo')}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">{t('reservations.email')}</Label>
                      <p className="font-semibold">{selectedReservation.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">{t('reservations.phone')}</Label>
                      <p className="font-semibold">{selectedReservation.phone}</p>
                    </div>
                  </div>
                </div>

                {selectedReservation.specialRequests && (
                  <div className="space-y-2">
                    <Label className="text-gray-600">{t('reservations.specialRequests')}</Label>
                    <p className="p-3 bg-gray-50 rounded-lg border">{selectedReservation.specialRequests}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-gray-600">{t('reservations.created')}</Label>
                    <p className="text-sm">{formatDateTime(selectedReservation.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">{t('reservations.lastUpdated')}</Label>
                    <p className="text-sm">{formatDateTime(selectedReservation.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 border-t">
              <Button onClick={() => setIsDetailModalOpen(false)} className="w-full">
                {t('reservations.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <Trash2 className="w-5 h-5" />
                <DialogTitle>{t('reservations.confirmDeleteTitle')}</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                {t('reservations.confirmDeleteDescription')} <strong>{reservationToDelete?.customerName}</strong>?
                <br />
                <span className="text-red-600 font-medium mt-2 block">
                  {t('reservations.deleteWarning')}
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1"
              >
                {t('reservations.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('reservations.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};