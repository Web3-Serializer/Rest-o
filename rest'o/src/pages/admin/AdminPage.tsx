import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Search, Users, Settings, Plus, Edit, Trash2, Shield, User, Phone, Check, X, Building, Mail, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { adminAPI, restaurantAPI } from '@/services/api.service';
import { UserLayout } from '@/components/layout/UserLayout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
  isActive: boolean;
  createdAt: string;
}

interface OpeningHours {
  open: string;
  close: string;
  isOpen: boolean;
}

interface RestaurantOpeningHours {
  monday: OpeningHours;
  tuesday: OpeningHours;
  wednesday: OpeningHours;
  thursday: OpeningHours;
  friday: OpeningHours;
  saturday: OpeningHours;
  sunday: OpeningHours;
}

interface Restaurant {
  _id?: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  theme: string;
  openingHours: RestaurantOpeningHours;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const AdminPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [restaurant, setRestaurant] = useState<Restaurant>({
        name: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        theme: 'default',
        openingHours: {
            monday: { open: '09:00', close: '18:00', isOpen: true },
            tuesday: { open: '09:00', close: '18:00', isOpen: true },
            wednesday: { open: '09:00', close: '18:00', isOpen: true },
            thursday: { open: '09:00', close: '18:00', isOpen: true },
            friday: { open: '09:00', close: '18:00', isOpen: true },
            saturday: { open: '09:00', close: '18:00', isOpen: false },
            sunday: { open: '09:00', close: '18:00', isOpen: false }
        },
        isActive: true
    });

    const updateOpeningHours = (day: keyof RestaurantOpeningHours, field: keyof OpeningHours, value: string | boolean) => {
        setRestaurant(prev => ({
            ...prev,
            openingHours: {
            ...prev.openingHours,
            [day]: {
                ...prev.openingHours[day],
                [field]: value
            }
            }
        }));
    };

    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user' as User['role']
    });

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: 'user' as User['role'],
        isActive: true
    });

    useEffect(() => {
        fetchUsers();
        fetchRestaurant();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getUsers();
            setUsers(response.data.users || response.data);
        } catch (err: any) {
            toast.error(err.message || t('admin.errors.fetchUsers'));
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurant = async () => {
        try {
            const response = await restaurantAPI.getRestaurantSettings();
            if (response.data && response.data.restaurant) {
                const restaurantData = response.data.restaurant;
                setRestaurant({
                    name: restaurantData.name || '',
                    description: restaurantData.description || '',
                    email: restaurantData.email || '',
                    phone: restaurantData.phone || '',
                    address: restaurantData.address || '',
                    theme: restaurantData.theme || 'default',
                    openingHours: restaurantData.openingHours,
                    isActive: restaurantData.isActive ?? true,
                    _id: restaurantData._id,
                    createdAt: restaurantData.createdAt,
                    updatedAt: restaurantData.updatedAt
                });
            }
        } catch (err: any) {
            console.error('Error fetching restaurant:', err);
        }
    };

    const handleCreateUser = async () => {
        try {
            const response = await adminAPI.createUser(createForm);
            setUsers(prev => [...prev, response.data.user]);
            setIsCreateDialogOpen(false);
            setCreateForm({ name: '', email: '', password: '', role: 'user' });
            toast.success(t('admin.createSuccess'));
        } catch (err: any) {
            toast.error(err.message || t('admin.errors.createUser'));
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        
        try {
            const response = await adminAPI.updateUser(selectedUser._id, editForm);
            setUsers(prev => prev.map(user => 
                user._id === selectedUser._id ? response.data.user : user
            ));
            setIsEditDialogOpen(false);
            setSelectedUser(null);
            toast.success(t('admin.updateSuccess'));
        } catch (err: any) {
            toast.error(err.message || t('admin.errors.updateUser'));
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm(t('admin.confirmDelete'))) return;
        
        try {
            await adminAPI.deleteUser(userId);
            setUsers(prev => prev.filter(user => user._id !== userId));
            toast.success(t('admin.deleteSuccess'));
        } catch (err: any) {
            toast.error(err.message || t('admin.errors.deleteUser'));
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            const response = await adminAPI.updateUser(user._id, { isActive: !user.isActive });
            setUsers(prev => prev.map(u => 
                u._id === user._id ? response.data.user : u
            ));
            toast.success(t(user.isActive ? 'admin.deactivateSuccess' : 'admin.activateSuccess'));
        } catch (err: any) {
            toast.error(err.message || t('admin.errors.toggleStatus'));
        }
    };

    const handleSaveRestaurantSettings = async () => {
        try {
            const updateData = {
                name: restaurant.name,
                description: restaurant.description,
                email: restaurant.email,
                phone: restaurant.phone,
                address: restaurant.address,
                theme: restaurant.theme,
                openingHours: restaurant.openingHours,
                isActive: restaurant.isActive
            };
                
            await restaurantAPI.updateRestaurantSettings(updateData);
            toast.success(t('admin.restaurantSettingsSaved'));
        } catch (err: any) {
            toast.error(err.message || t('admin.errors.saveSettings'));
        }
    };

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
            });
        setIsEditDialogOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
        case 'admin': return 'bg-red-100 text-red-800 border-red-200';
        case 'manager': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    if (loading) return <LoadingSpinner />;

    return (
        <UserLayout>
        <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{t('admin.pageTitle')}</h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">{t('admin.pageDescription')}</p>
            </div>
            </div>

            <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users" className="flex items-center gap-2 text-xs sm:text-sm">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.usersManagement')}</span>
                <span className="sm:hidden">{t('admin.users')}</span>
                </TabsTrigger>
                <TabsTrigger value="restaurant" className="flex items-center gap-2 text-xs sm:text-sm">
                <Building className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.restaurantSettings')}</span>
                <span className="sm:hidden">{t('admin.restaurant')}</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold">{t('admin.usersManagement')}</h2>
                    <p className="text-gray-600 text-sm sm:text-base">{t('admin.usersManagementDescription')}</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('admin.createUser')}</span>
                    <span className="sm:hidden">{t('admin.create')}</span>
                </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                    <CardTitle className="text-xs font-medium">{t('admin.totalUsers')}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                    <CardTitle className="text-xs font-medium">{t('admin.activeUsers')}</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                    <CardTitle className="text-xs font-medium">{t('admin.admins')}</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                    <CardTitle className="text-xs font-medium">{t('admin.staff')}</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{users.filter(u => ['manager', 'staff'].includes(u.role)).length}</div>
                    </CardContent>
                </Card>
                </div>

                <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder={t('admin.searchPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t('admin.filterByRole')} />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
                        <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                        <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                        <SelectItem value="staff">{t('roles.staff')}</SelectItem>
                        <SelectItem value="user">{t('roles.user')}</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="hidden md:block border rounded-lg">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.user')}</TableHead>
                            <TableHead>{t('admin.role')}</TableHead>
                            <TableHead>{t('admin.status')}</TableHead>
                            <TableHead>{t('admin.created')}</TableHead>
                            <TableHead className="text-right">{t('admin.actions')}</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user._id}>
                            <TableCell>
                                <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                {t(`roles.${user.role}`)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                {user.isActive ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                    <X className="h-4 w-4 text-red-600" />
                                )}
                                <span>{user.isActive ? t('admin.active') : t('admin.inactive')}</span>
                                </div>
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleStatus(user)}
                                >
                                    {user.isActive ? t('admin.deactivateShort') : t('admin.activateShort')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(user)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </div>

                    <div className="md:hidden space-y-3">
                        {filteredUsers.map((user) => (
                        <Card key={user._id} className="p-4">
                            <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="font-medium text-lg">{user.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                                </div>
                            </div>
                            <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                {t(`roles.${user.role}`)}
                            </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                {user.isActive ? (
                                <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                <X className="h-4 w-4 text-red-600" />
                                )}
                                <span>{user.isActive ? t('admin.active') : t('admin.inactive')}</span>
                            </div>
                            <div className="text-gray-500">
                                {formatDate(user.createdAt)}
                            </div>
                            </div>

                            <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(user)}
                                className="flex-1 text-xs"
                            >
                                {user.isActive ? t('admin.deactivateShort') : t('admin.activateShort')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                                className="px-3"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                                className="px-3 text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </div>
                        </Card>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>{t('admin.noUsersFound')}</p>
                        </div>
                    )}
                </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="restaurant" className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold">{t('admin.restaurantSettings')}</h2>
                    <p className="text-gray-600 text-sm sm:text-base">{t('admin.restaurantSettingsDescription')}</p>
                </div>

                <Card>
                    {/* <CardHeader className="p-2 sm:p-6">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            {t('admin.restaurantInformation')}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">{t('admin.restaurantInformationDescription')}</CardDescription>
                    </CardHeader> */}
                    
                    <CardContent className="p-4 sm:p-6 space-y-6">

                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('admin.basicInformation')}
                        </h3>
                        
                        <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="restaurant-name" className="text-sm sm:text-base">{t('admin.restaurantName')}</Label>
                            <Input
                            id="restaurant-name"
                            value={restaurant.name}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={t('admin.restaurantNamePlaceholder')}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="restaurant-description" className="text-sm sm:text-base">{t('admin.restaurantDescription')}</Label>
                            <Textarea
                            id="restaurant-description"
                            value={restaurant.description}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, description: e.target.value }))}
                            placeholder={t('admin.restaurantDescriptionPlaceholder')}
                            rows={3}
                            />
                        </div>
                        </div>
                    </div>


                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {t('admin.contactInformation')}
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="restaurant-email" className="text-sm sm:text-base">{t('admin.restaurantEmail')}</Label>
                            <Input
                            id="restaurant-email"
                            type="email"
                            value={restaurant.email}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, email: e.target.value }))}
                            placeholder={t('admin.restaurantEmailPlaceholder')}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="restaurant-phone" className="text-sm sm:text-base">{t('admin.restaurantPhone')}</Label>
                            <Input
                            id="restaurant-phone"
                            value={restaurant.phone}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder={t('admin.restaurantPhonePlaceholder')}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="restaurant-address" className="text-sm sm:text-base">{t('admin.restaurantAddress')}</Label>
                            <Input
                            id="restaurant-address"
                            value={restaurant.address}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, address: e.target.value }))}
                            placeholder={t('admin.restaurantAddressPlaceholder')}
                            />
                        </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t('admin.restaurantStatus')}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label htmlFor="restaurant-status" className="text-sm sm:text-base">{t('admin.restaurantActive')}</Label>
                            <p className="text-xs text-gray-500">{t('admin.restaurantStatusDescription')}</p>
                        </div>
                        <Switch
                            id="restaurant-status"
                            checked={restaurant.isActive}
                            onCheckedChange={(checked) => setRestaurant(prev => ({ ...prev, isActive: checked }))}
                        />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t('admin.openingHours')}
                        </h3>

                        <div className="hidden md:block border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">{t('admin.day')}</TableHead>
                                <TableHead className="w-[80px] text-center">{t('admin.status')}</TableHead>
                                <TableHead>{t('admin.open')}</TableHead>
                                <TableHead>{t('admin.close')}</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                                <TableRow key={day}>
                                <TableCell className="font-medium capitalize">
                                    {t(`days.${day}`)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center">
                                    <Switch
                                        checked={hours.isOpen}
                                        onCheckedChange={(checked) => 
                                        updateOpeningHours(day as keyof RestaurantOpeningHours, 'isOpen', checked)
                                        }
                                    />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Input
                                    type="time"
                                    value={hours.open}
                                    onChange={(e) => 
                                        updateOpeningHours(day as keyof RestaurantOpeningHours, 'open', e.target.value)
                                    }
                                    disabled={!hours.isOpen}
                                    className="w-full"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                    type="time"
                                    value={hours.close}
                                    onChange={(e) => 
                                        updateOpeningHours(day as keyof RestaurantOpeningHours, 'close', e.target.value)
                                    }
                                    disabled={!hours.isOpen}
                                    className="w-full"
                                    />
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>

                        <div className="md:hidden space-y-3">
                            {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                                <Card key={day} className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${hours.isOpen ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <span className="font-medium capitalize text-sm">
                                        {t(`days.${day}`)}
                                    </span>
                                    </div>
                                    <Switch
                                    checked={hours.isOpen}
                                    onCheckedChange={(checked) => 
                                        updateOpeningHours(day as keyof RestaurantOpeningHours, 'isOpen', checked)
                                    }
                                    />
                                </div>

                                {hours.isOpen ? (
                                    <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">{t('admin.open')}</Label>
                                        <Input
                                        type="time"
                                        value={hours.open}
                                        onChange={(e) => 
                                            updateOpeningHours(day as keyof RestaurantOpeningHours, 'open', e.target.value)
                                        }
                                        className="w-full text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">{t('admin.close')}</Label>
                                        <Input
                                        type="time"
                                        value={hours.close}
                                        onChange={(e) => 
                                            updateOpeningHours(day as keyof RestaurantOpeningHours, 'close', e.target.value)
                                        }
                                        className="w-full text-sm"
                                        />
                                    </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-2 text-gray-500 text-sm">
                                    {t('admin.closed')}
                                    </div>
                                )}
                                </Card>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="restaurant-theme" className="text-sm sm:text-base">
                                {t('admin.theme')}
                            </Label>

                            <Select
                                value={restaurant.theme || 'default'}
                                onValueChange={(value) =>
                                setRestaurant(prev => ({
                                    ...prev,
                                    theme: value
                                }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('admin.selectTheme')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="fastfood">FastFood</SelectItem>
                                    <SelectItem value="retro">Retro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        <Button 
                            onClick={handleSaveRestaurantSettings} 
                            className="flex-1"
                        >
                        {t('admin.saveSettings')}
                        </Button>
                        <Button 
                        variant="outline" 
                        onClick={() => {
                            setRestaurant({
                                name: '',
                                description: '',
                                email: '',
                                phone: '',
                                address: '',
                                theme: 'default',
                                openingHours: {
                                    monday: { open: '09:00', close: '18:00', isOpen: true },
                                    tuesday: { open: '09:00', close: '18:00', isOpen: true },
                                    wednesday: { open: '09:00', close: '18:00', isOpen: true },
                                    thursday: { open: '09:00', close: '18:00', isOpen: true },
                                    friday: { open: '09:00', close: '18:00', isOpen: true },
                                    saturday: { open: '09:00', close: '18:00', isOpen: false },
                                    sunday: { open: '09:00', close: '18:00', isOpen: false }
                                },
                                isActive: true
                            });
                        }}
                        className="flex-1"
                        >
                        {t('admin.reset')}
                        </Button>
                    </div>
                    </CardContent>
                </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-md [&>button]:hidden">
                <DialogHeader>
                <DialogTitle>{t('admin.createUser')}</DialogTitle>
                <DialogDescription>{t('admin.createUserDescription')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('admin.name')}</Label>
                    <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('admin.namePlaceholder')}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">{t('admin.email')}</Label>
                    <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('admin.emailPlaceholder')}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">{t('admin.password')}</Label>
                    <Input
                    id="password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={t('admin.passwordPlaceholder')}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">{t('admin.role')}</Label>
                    <Select value={createForm.role} onValueChange={(value: User['role']) => setCreateForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className='w-full'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">{t('roles.user')}</SelectItem>
                        <SelectItem value="staff">{t('roles.staff')}</SelectItem>
                        <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                        <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                    {t('admin.cancel')}
                </Button>
                <Button onClick={handleCreateUser} disabled={!createForm.name || !createForm.email || !createForm.password} className="flex-1">
                    {t('admin.create')}
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md [&>button]:hidden">
                <DialogHeader>
                <DialogTitle>{t('admin.editUser')}</DialogTitle>
                <DialogDescription>{t('admin.editUserDescription')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-name">{t('admin.name')}</Label>
                    <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-email">{t('admin.email')}</Label>
                    <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-role">{t('admin.role')}</Label>
                    <Select value={editForm.role} onValueChange={(value: User['role']) => setEditForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className='w-full'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">{t('roles.user')}</SelectItem>
                        <SelectItem value="staff">{t('roles.staff')}</SelectItem>
                        <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                        <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                    id="edit-status"
                    checked={editForm.isActive}
                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="edit-status">{t('admin.active')}</Label>
                </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                    {t('admin.cancel')}
                </Button>
                <Button onClick={handleUpdateUser} className="flex-1">
                    {t('admin.update')}
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
        </UserLayout>
    );
};