import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UserLayout } from '@/components/layout/UserLayout';
import { menuAPI, orderAPI } from '@/services/api.service';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { UtensilsCrossed, Edit, Trash2, Plus, X, Euro, Filter, ChevronDown, ChevronUp, ShoppingCart, Minus, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Menu {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  isAvailable?: boolean;
  ingredients?: string[];
  allergens?: string[];
  image?: string; // Stockera le base64
}

interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  items: OrderItem[];
  totalAmount: number;
  tableNumber: string;
  notes?: string;
}

export const MenusPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState<Menu | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [order, setOrder] = useState<Order>({ items: [], totalAmount: 0, tableNumber: '', notes: '' });
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [clickedMenuId, setClickedMenuId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    category: 'all',
    availability: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await menuAPI.getAll();
        setMenus(res.data.menus);
      } catch (err) {
        console.error('Failed to fetch menus', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  useEffect(() => {
    if (isEditModalOpen && menuToEdit) {
      setIngredientInput('');
      setAllergenInput('');
    }
  }, [isEditModalOpen, menuToEdit]);

  const filteredMenus = useMemo(() => {
    let filtered = menus.filter(menu =>
      menu.name.toLowerCase().includes(search.toLowerCase()) ||
      menu.description?.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.category !== 'all') {
      filtered = filtered.filter(menu => menu.category === filters.category);
    }

    if (filters.availability !== 'all') {
      filtered = filtered.filter(menu => 
        filters.availability === 'available' ? menu.isAvailable : !menu.isAvailable
      );
    }

    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Menu];
      let bValue: any = b[filters.sortBy as keyof Menu];
      
      if (filters.sortBy === 'price') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [menus, search, filters]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(menus.map(menu => menu.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [menus]);

  const totalPages = Math.ceil(filteredMenus.length / ITEMS_PER_PAGE);
  const paginatedMenus = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMenus.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMenus, currentPage]);

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const handleDeleteClick = (menu: Menu) => {
    setMenuToDelete(menu);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!menuToDelete?._id) return;
    try {
      await menuAPI.delete(menuToDelete._id);
      setMenus(prev => prev.filter(m => m._id !== menuToDelete._id));
      toast.success(t('menus.deleteSuccess'))
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteModalOpen(false);
      setMenuToDelete(null);
    }
  };

  const handleEditClick = (menu?: Menu) => {
    setMenuToEdit(menu ? { ...menu } : { 
      name: '', 
      description: '', 
      price: 0, 
      isAvailable: true,
      ingredients: [],
      allergens: []
    });
    setIsEditModalOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('menus.invalidImageType'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('menus.imageTooLarge'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setMenuToEdit(prev => prev ? { ...prev, image: base64 } : null);
      toast.success(t('menus.imageUploaded'));
    };

    reader.onerror = () => {
      toast.error(t('menus.uploadError'));
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setMenuToEdit(prev => prev ? { ...prev, image: "" } : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveMenu = async () => {
    if (!menuToEdit) return;
    
    setIsSubmitting(true);
    try {
      if (menuToEdit._id) {
        await menuAPI.update(menuToEdit._id, menuToEdit);
        setMenus(prev => prev.map(m => (m._id === menuToEdit._id ? menuToEdit : m)));
        toast.success(t('menus.updateSuccess'))
      } else {
        const res = await menuAPI.create(menuToEdit);
        toast.success(t('menus.saveSuccess'))
        setMenus(prev => [...prev, res.data.menu]);
      }
      setIsEditModalOpen(false);
      setMenuToEdit(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim() && menuToEdit) {
      const newIngredient = ingredientInput.trim();
      const updatedIngredients = [...(menuToEdit.ingredients || []), newIngredient];
      setMenuToEdit(prev => prev ? { ...prev, ingredients: updatedIngredients } : null);
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    if (menuToEdit) {
      const updatedIngredients = menuToEdit.ingredients?.filter((_, i) => i !== index) || [];
      setMenuToEdit(prev => prev ? { ...prev, ingredients: updatedIngredients } : null);
    }
  };

  const handleIngredientKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const addAllergen = () => {
    if (allergenInput.trim() && menuToEdit) {
      const newAllergen = allergenInput.trim();
      const updatedAllergens = [...(menuToEdit.allergens || []), newAllergen];
      setMenuToEdit(prev => prev ? { ...prev, allergens: updatedAllergens } : null);
      setAllergenInput('');
    }
  };

  const removeAllergen = (index: number) => {
    if (menuToEdit) {
      const updatedAllergens = menuToEdit.allergens?.filter((_, i) => i !== index) || [];
      setMenuToEdit(prev => prev ? { ...prev, allergens: updatedAllergens } : null);
    }
  };

  const handleAllergenKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllergen();
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      availability: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setSearch('');
  };

  const hasActiveFilters = filters.category !== 'all' || 
    filters.availability !== 'all' || 
    filters.sortBy !== 'name' || 
    filters.sortOrder !== 'asc' || 
    search;

  const addToOrder = (menu: Menu) => {
    if (!menu._id || !menu.isAvailable) return;

    setClickedMenuId(menu._id);
    
    setOrder(prev => {
      const existingItem = prev.items.find(item => item.menuId === menu._id);
      let newItems: OrderItem[];
      
      if (existingItem) {
        newItems = prev.items.map(item =>
          item.menuId === menu._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
          ...prev.items,
          {
            menuId: menu._id!,
            name: menu.name,
            price: menu.price,
            quantity: 1
          }
        ];
      }

      setTimeout(() => setClickedMenuId(null), 50);
      toast.success(t("menus.addedToCart"))
      
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...prev,
        items: newItems,
        totalAmount
      };
    });
  };

  const removeFromOrder = (menuId: string) => {
    setOrder(prev => {
      const newItems = prev.items.filter(item => item.menuId !== menuId);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...prev,
        items: newItems,
        totalAmount
      };
    });
  };

  const updateQuantity = (menuId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromOrder(menuId);
      return;
    }
    
    setOrder(prev => {
      const newItems = prev.items.map(item =>
        item.menuId === menuId 
          ? { ...item, quantity: newQuantity }
          : item
      );
      
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...prev,
        items: newItems,
        totalAmount
      };
    });
  };

  const clearOrder = () => {
    setOrder({ items: [], totalAmount: 0, tableNumber: '', notes: '' });
  };

  const confirmOrder = async () => {
    if (order.items.length === 0) return;

    if (!order.tableNumber) {
      toast.error(t('menus.tableNumberRequired'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      const orderData = {
        items: order.items.map(item => ({
          menu: item.menuId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: order.totalAmount,
        tableNumber: order.tableNumber,
        notes: order.notes || undefined
      };

      await orderAPI.create(orderData);

      toast.success(t('menus.orderSuccess'))
      
      setIsOrderSuccess(true);
      clearOrder();
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error('Failed to place order', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderItemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <LoadingSpinner />;

  if (!menus.length)
    return (
      <UserLayout>
        <p>{t('menus.noMenus')}</p>
      </UserLayout>
    );

  return (
    <UserLayout>
      <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        <h1 className="text-2xl font-bold">{t('menus.pageTitle')}</h1>
        <p>{t('menus.pageDescription')}</p>
        <div className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder={t('menus.searchPlaceholder')}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full"
          />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{t('menus.filters')}</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {hasActiveFilters && (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsOrderModalOpen(true)}
              disabled={orderItemCount === 0}
              className="flex items-center justify-center gap-2 relative flex-1 sm:flex-none"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{t('menus.cart')}</span>
              {orderItemCount > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {orderItemCount}
                </Badge>
              )}
            </Button>

            {isAdminOrManager && (
              <Button
                onClick={() => handleEditClick()}
                className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4" />
                <span>{t('menus.addMenu')}</span>
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-filter">{t('menus.category')}</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value: string) =>
                    setFilters(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger id="category-filter" className="w-full">
                    <SelectValue placeholder={t('menus.allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('menus.allCategories')}</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {t(`menus.categories.${category}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability-filter">{t('menus.availability')}</Label>
                <Select
                  value={filters.availability}
                  onValueChange={(value: string) => setFilters(prev => ({ ...prev, availability: value }))}
                >
                  <SelectTrigger id="availability-filter" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('menus.allStatus')}</SelectItem>
                    <SelectItem value="available">{t('menus.available')}</SelectItem>
                    <SelectItem value="unavailable">{t('menus.unavailable')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-by">{t('menus.sortBy')}</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: string) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger id="sort-by" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">{t('menus.sortByName')}</SelectItem>
                    <SelectItem value="price">{t('menus.sortByPrice')}</SelectItem>
                    <SelectItem value="category">{t('menus.sortByCategory')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-order">{t('menus.sortOrder')}</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: string) => setFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger id="sort-order" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">{t('menus.ascending')}</SelectItem>
                    <SelectItem value="desc">{t('menus.descending')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600 text-center sm:text-left">
                {t('menus.showing')} {filteredMenus.length} {t('menus.of')} {menus.length} {t('menus.menus')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full sm:w-auto"
              >
                {t('menus.clearFilters')}
              </Button>
            </div>
          </div>
        )}

        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {paginatedMenus.map(menu => (
              <div
                key={menu._id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative group bg-white"
              >
                <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
                  {menu.image ? (
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <UtensilsCrossed className="h-12 w-12 mb-2" />
                      <span className="text-sm">{t('menus.noImage')}</span>
                    </div>
                  )}
                  {!menu.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-gray-800 text-white">
                        {t('menus.unavailable')}
                      </Badge>
                    </div>
                  )}
                  {isAdminOrManager && (
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleEditClick(menu)}
                        className="h-8 w-8 bg-white/90 hover:bg-white shadow-md"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleDeleteClick(menu)}
                        className="h-8 w-8 bg-white/90 hover:bg-white shadow-md"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{menu.name}</h3>
                    <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-green-600 shrink-0">
                      <Euro className="w-4 h-4" />
                      {menu.price.toFixed(2)}
                    </div>
                  </div>

                  {menu.category && (
                    <Badge variant="outline" className="self-start mb-2 text-xs">
                      {t(`menus.categories.${menu.category}`)}
                    </Badge>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 cursor-help border-l-2 border-gray-200 pl-2">
                        {menu.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-3 bg-white border shadow-lg text-gray-800">
                      <div className="space-y-2">
                        {menu.ingredients && menu.ingredients.length > 0 && (
                          <div>
                            <span className="font-semibold text-sm">{t('menus.ingredients')}:</span>
                            <p className="text-sm text-gray-600">{menu.ingredients.join(', ')}</p>
                          </div>
                        )}
                        {menu.allergens && menu.allergens.length > 0 && (
                          <div>
                            <span className="font-semibold text-sm text-red-600">{t('menus.allergens')}:</span>
                            <p className="text-sm text-red-600">{menu.allergens.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Button
                    onClick={() => addToOrder(menu)}
                    disabled={!menu.isAvailable}
                    className={`mt-auto text-sm 
                      ${menu.isAvailable 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }
                      ${clickedMenuId === menu._id ? 'scale-105 shadow-lg transition-transform duration-50' : 'transition-transform duration-300'}
                    
                    `}
                    
                  >
                    {t('menus.addToOrder')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 sm:gap-4 mt-4 sm:mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              {t('menus.prev')}
            </Button>
            <span className="text-xs sm:text-sm text-gray-600 px-2">
              {t('menus.page')} {currentPage} {t('menus.of')} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              {t('menus.next')}
            </Button>
          </div>
        )}

        <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5" />
                <DialogTitle>{t('menus.yourOrder')}</DialogTitle>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              {order.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                  <p>{t('menus.emptyCart')}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.menuId} className="flex items-center justify-between p-3 border rounded-lg gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.price.toFixed(2)}€</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeFromOrder(item.menuId)}
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="tableNumber" className="required">{t('menus.tableNumber')}</Label>
                      <Input
                        id="tableNumber"
                        placeholder={t('menus.tableNumberPlaceholder')}
                        value={order.tableNumber || ''}
                        onChange={(e) => setOrder(prev => ({ ...prev, tableNumber: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">{t('menus.notes')}</Label>
                      <Textarea
                        id="notes"
                        placeholder={t('menus.notesPlaceholder')}
                        value={order.notes || ''}
                        onChange={(e) => setOrder(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>{t('menus.total')}</span>
                      <span>{order.totalAmount.toFixed(2)}€</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex flex-col gap-2 pt-4 border-t">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="flex-1"
                >
                  {t('menus.continueShopping')}
                </Button>
                {order.items.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={clearOrder}
                      className="flex-1"
                    >
                      {t('menus.clearOrder')}
                    </Button>
                    <Button
                      onClick={() => setIsConfirmModalOpen(true)}
                      className="flex-1"
                    >
                      {t('menus.confirmOrder')}
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent className="sm:max-w-md [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Check className="w-5 h-5" />
                <DialogTitle>{t('menus.confirmOrderTitle')}</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                {t('menus.confirmOrderDescription')}
                <br />
                <strong>{t('menus.total')}: {order.totalAmount.toFixed(2)}€</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1"
              >
                {t('menus.cancel')}
              </Button>
              <Button
                onClick={confirmOrder}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('menus.placingOrder')}
                  </div>
                ) : (
                  t('menus.confirm')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isOrderSuccess} onOpenChange={setIsOrderSuccess}>
          <DialogContent className="sm:max-w-md [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Check className="w-5 h-5" />
                <DialogTitle>{t('menus.orderSuccess')}</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                {t('menus.orderSuccessDescription')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setIsOrderSuccess(false)}
                className="w-full"
              >
                {t('menus.ok')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <Trash2 className="w-5 h-5" />
                <DialogTitle>{t('menus.confirmDeleteTitle')}</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                {t('menus.confirmDeleteDescription')} <strong>"{menuToDelete?.name}"</strong>?
                <br />
                <span className="text-red-600 font-medium mt-2 block">
                  {t('menus.deleteWarning')}
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1"
              >
                {t('menus.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('menus.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                {menuToEdit?._id ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <DialogTitle>
                  {menuToEdit?._id ? t('menus.editMenu') : t('menus.addMenu')}
                </DialogTitle>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('menus.name')} *</Label>
                  <Input
                    id="name"
                    placeholder={t('menus.namePlaceholder')}
                    value={menuToEdit?.name || ''}
                    onChange={(e) =>
                      setMenuToEdit(prev => prev ? { ...prev, name: e.target.value } : null)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('menus.description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('menus.descriptionPlaceholder')}
                    value={menuToEdit?.description || ''}
                    onChange={(e) =>
                      setMenuToEdit(prev => prev ? { ...prev, description: e.target.value } : null)
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">{t('menus.image')}</Label>
                  <div className="space-y-3">
                    <Input
                      ref={fileInputRef}
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    <div className="text-xs text-gray-500">
                      {t('menus.imageHelp')}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">{t('menus.price')} (€) *</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={menuToEdit?.price || ''}
                      onChange={(e) =>
                        setMenuToEdit(prev => prev ? { ...prev, price: Number(e.target.value) } : null)
                      }
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t('menus.category')}</Label>
                  <Select
                    value={menuToEdit?.category || ''}
                    onValueChange={(value: string) =>
                      setMenuToEdit(prev => prev ? { ...prev, category: value } : null)
                    }
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder={t('menus.categoryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appetizer">{t('menus.categories.appetizer')}</SelectItem>
                      <SelectItem value="main">{t('menus.categories.main')}</SelectItem>
                      <SelectItem value="dessert">{t('menus.categories.dessert')}</SelectItem>
                      <SelectItem value="drink">{t('menus.categories.drink')}</SelectItem>
                      <SelectItem value="other">{t('menus.categories.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                {menuToEdit?.image && (
                  <div className="space-y-2">
                    <Label>{t('menus.imagePreview')}</Label>
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <div className="relative">
                        <img
                          src={menuToEdit.image}
                          alt={t('menus.imagePreview')}
                          className="w-full h-40 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        {t('menus.clickToRemove')}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="ingredients">{t('menus.ingredients')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="ingredients"
                      placeholder={t('menus.ingredientsPlaceholder')}
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyPress={handleIngredientKeyPress}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addIngredient}
                      disabled={!ingredientInput.trim()}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {menuToEdit?.ingredients?.map((ingredient, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="allergens">{t('menus.allergens')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="allergens"
                      placeholder={t('menus.allergensPlaceholder')}
                      value={allergenInput}
                      onChange={(e) => setAllergenInput(e.target.value)}
                      onKeyPress={handleAllergenKeyPress}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addAllergen}
                      disabled={!allergenInput.trim()}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {menuToEdit?.allergens?.map((allergen, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {allergen}
                        <button
                          type="button"
                          onClick={() => removeAllergen(index)}
                          className="ml-1 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="available" className="cursor-pointer">
                    {t('menus.available')}
                  </Label>
                  <Switch
                    id="available"
                    checked={menuToEdit?.isAvailable ?? true}
                    onCheckedChange={(checked: boolean) =>
                      setMenuToEdit(prev => prev ? { ...prev, isAvailable: checked } : null)
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                {t('menus.cancel')}
              </Button>
              <Button
                onClick={saveMenu}
                disabled={isSubmitting || !menuToEdit?.name || !menuToEdit?.price}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {menuToEdit?._id ? t('menus.updating') : t('menus.saving')}
                  </div>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    {menuToEdit?._id ? t('menus.update') : t('menus.save')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};