import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserLayout } from '@/components/layout/UserLayout';
import { menuAPI, orderAPI } from '@/services/api.service';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { ShoppingCart, Trash2, Plus, Minus, Search, Grid3x3, List, DollarSign, CreditCard, Banknote, Receipt, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Menu {
  _id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  isAvailable?: boolean;
  image?: string;
}

interface CartItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  items: CartItem[];
  totalAmount: number;
  tableNumber?: string;
  customerName?: string;
  notes?: string;
}

const categories = ['all', 'appetizer', 'main', 'dessert', 'drink', 'other'];

export const PosPage = () => {
  const { t } = useTranslation();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order>({
    items: [],
    totalAmount: 0,
    tableNumber: '',
    customerName: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderDetails(prev => ({ ...prev, items: cart, totalAmount: total }));
  }, [cart]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await menuAPI.getAll();
      setMenus(res.data.menus.filter((m: Menu) => m.isAvailable));
    } catch (err) {
      console.error('Failed to fetch menus', err);
      toast.error(t('pos.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredMenus = useMemo(() => {
    let filtered = menus.filter(menu =>
      menu.name.toLowerCase().includes(search.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(menu => menu.category === selectedCategory);
    }

    return filtered;
  }, [menus, search, selectedCategory]);

  const addToCart = (menu: Menu) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuId === menu._id);
      if (existingItem) {
        return prev.map(item =>
          item.menuId === menu._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        menuId: menu._id,
        name: menu.name,
        price: menu.price,
        quantity: 1
      }];
    });
    toast.success(`${menu.name} ${t('pos.addedToCart')}`);
  };

  const removeFromCart = (menuId: string) => {
    setCart(prev => prev.filter(item => item.menuId !== menuId));
  };

  const updateQuantity = (menuId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(menuId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.menuId === menuId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setOrderDetails({
      items: [],
      totalAmount: 0,
      tableNumber: '',
      customerName: '',
      notes: ''
    });
    setCashReceived('');
    setIsCartOpen(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(t('pos.emptyCart'));
      return;
    }
    setIsPaymentModalOpen(true);
    setIsCartOpen(false);
  };

  const processPayment = async () => {
    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived);
      if (isNaN(received) || received < orderDetails.totalAmount) {
        toast.error(t('pos.insufficientAmount'));
        return;
      }
    }

    setIsProcessing(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          menu: item.menuId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: orderDetails.totalAmount,
        tableNumber: orderDetails.tableNumber || undefined,
        customerName: orderDetails.customerName || undefined,
        notes: orderDetails.notes || undefined
      };

      const response = await orderAPI.create(orderData);
      setLastOrderNumber(response.data.order.orderNumber);
      setIsPaymentModalOpen(false);
      setIsSuccessModalOpen(true);
      clearCart();
      toast.success(t('pos.orderSuccess'));
    } catch (err) {
      console.error('Failed to process payment', err);
      toast.error(t('pos.paymentError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const changeAmount = paymentMethod === 'cash' ? parseFloat(cashReceived) - cartTotal : 0;

  // Composant pour le panier mobile (Sheet)
  const CartContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b bg-white sticky top-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            {t('pos.cart')}
          </h2>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-600 h-8 px-2">
              <Trash2 className="w-3 h-3 mr-1" />
              {t('pos.clear')}
            </Button>
          )}
        </div>
        <Badge variant="secondary" className="text-xs">
          {cartItemCount} {t('pos.items')}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm">{t('pos.emptyCart')}</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.menuId} className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs truncate">{item.name}</h4>
                <p className="text-xs text-gray-600">{item.price.toFixed(2)}€</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 min-w-6"
                  onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                >
                  <Minus className="w-2.5 h-2.5" />
                </Button>
                <span className="w-6 text-center font-semibold text-xs">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 min-w-6"
                  onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                >
                  <Plus className="w-2.5 h-2.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 min-w-6 text-red-600"
                  onClick={() => removeFromCart(item.menuId)}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </Button>
              </div>
              <p className="font-bold text-xs w-12 text-right">{(item.price * item.quantity).toFixed(2)}€</p>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-3 space-y-2 bg-white">
        <div className="space-y-1">
          <Input
            placeholder={t('pos.tableNumber')}
            value={orderDetails.tableNumber}
            onChange={(e) => setOrderDetails(prev => ({ ...prev, tableNumber: e.target.value }))}
            className="text-xs h-8"
          />
          <Input
            placeholder={t('pos.customerName')}
            value={orderDetails.customerName}
            onChange={(e) => setOrderDetails(prev => ({ ...prev, customerName: e.target.value }))}
            className="text-xs h-8"
          />
        </div>

        <div className="flex justify-between items-center py-2 border-t border-b">
          <span className="text-base font-semibold">{t('pos.total')}</span>
          <span className="text-xl font-bold text-green-600">{cartTotal.toFixed(2)}€</span>
        </div>

        <Button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="w-full h-10 text-base"
        >
          <Receipt className="w-4 h-4 mr-1" />
          {t('pos.checkout')}
        </Button>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <UserLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        {/* Header Mobile compact */}
        <div className="p-2 border-b bg-white sticky top-0 z-10 md:hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-gray-500" />
                <Input
                  type="text"
                  placeholder={t('pos.searchMenu')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="relative h-8 w-8"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1 overflow-x-auto flex-1 scrollbar-hide pr-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap flex-shrink-0 text-[10px] px-2 h-7"
                >
                  {t(`menus.categories.${category}`)}
                </Button>
              ))}
            </div>
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')} className="ml-1">
              <TabsList className="h-7">
                <TabsTrigger value="grid" className="px-2">
                  <Grid3x3 className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-2">
                  <List className="w-3 h-3" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Header Desktop */}
        <div className="hidden md:block p-4 border-b bg-white">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder={t('pos.searchMenu')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                <TabsList>
                  <TabsTrigger value="grid">
                    <Grid3x3 className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap flex-shrink-0"
              >
                {t(`menus.categories.${category}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Liste des menus */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-50">
            {filteredMenus.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 p-4">
                <p className="text-sm">{t('pos.noMenus')}</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredMenus.map(menu => (
                  <button
                    key={menu._id}
                    onClick={() => addToCart(menu)}
                    className="bg-white border rounded-lg p-1.5 hover:shadow-sm transition-all text-left group flex flex-col h-full min-h-0"
                  >
                    <div className="aspect-square bg-gray-100 rounded mb-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {menu.image ? (
                        <img 
                          src={menu.image} 
                          alt={menu.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-[10px] leading-tight line-clamp-2 group-hover:text-primary mb-0.5 flex-1">
                      {menu.name}
                    </h3>
                    <p className="text-[9px] text-gray-600 line-clamp-2 mb-1 hidden xs:block">
                      {menu.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-xs font-bold text-green-600">
                        {menu.price.toFixed(2)}€
                      </p>
                      {menu.category && (
                        <Badge variant="outline" className="text-[8px] hidden sm:inline-flex">
                          {t(`menus.categories.${menu.category}`)}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredMenus.map(menu => (
                  <button
                    key={menu._id}
                    onClick={() => addToCart(menu)}
                    className="w-full bg-white border rounded-lg p-2 hover:shadow-sm transition-all flex items-center gap-2 group text-left"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                      {menu.image ? (
                        <img 
                          src={menu.image} 
                          alt={menu.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs group-hover:text-primary truncate">
                        {menu.name}
                      </h3>
                      <p className="text-[10px] text-gray-600 line-clamp-1">
                        {menu.description}
                      </p>
                      {menu.category && (
                        <Badge variant="outline" className="mt-0.5 text-[8px]">
                          {t(`menus.categories.${menu.category}`)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-bold text-green-600 flex-shrink-0">
                      {menu.price.toFixed(2)}€
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Panier Desktop */}
          <div className="hidden md:block w-96 border-l bg-white flex flex-col">
            <CartContent />
          </div>
        </div>

        {/* Barre de panier mobile fixe en bas - version ultra compacte */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 shadow-lg z-20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">
                  {cartItemCount} {t('pos.items')} • {cartTotal.toFixed(2)}€
                </div>
              </div>
            </div>
            
            <div className="flex gap-1 flex-shrink-0">
              {cart.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearCart} 
                  className="text-red-600 h-7 px-2 min-w-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
              <Button 
                onClick={() => setIsCartOpen(true)}
                disabled={cart.length === 0}
                className="h-7 px-3 text-xs min-w-[80px]"
              >
                <Receipt className="w-3 h-3 mr-1" />
                {t('pos.checkout')}
              </Button>
            </div>
          </div>
        </div>

        {/* Sheet du panier mobile */}
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-xl p-0 max-h-[600px]">
            <SheetHeader className="sr-only">
              <SheetTitle>{t('pos.cart')}</SheetTitle>
            </SheetHeader>
            <CartContent />
          </SheetContent>
        </Sheet>

        {/* Modals avec taille réduite pour mobile */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="max-w-[95vw] rounded-lg sm:max-w-md max-h-[85vh] overflow-y-auto mx-2">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                {t('pos.payment')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className="flex-1 text-xs h-9"
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Banknote className="w-3.5 h-3.5 mr-1" />
                  {t('pos.cash')}
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="flex-1 text-xs h-9"
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1" />
                  {t('pos.card')}
                </Button>
              </div>

              <div className="p-3 bg-gray-50 rounded space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t('pos.subtotal')}</span>
                  <span className="font-semibold">{cartTotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-1">
                  <span>{t('pos.total')}</span>
                  <span className="text-green-600">{cartTotal.toFixed(2)}€</span>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="cash-received" className="text-sm">{t('pos.cashReceived')}</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-500" />
                      <Input
                        id="cash-received"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  </div>

                  {cashReceived && parseFloat(cashReceived) >= cartTotal && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-800 text-sm">{t('pos.change')}</span>
                        <span className="text-lg font-bold text-green-600">{changeAmount.toFixed(2)}€</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-sm">{t('pos.notes')}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('pos.notesPlaceholder')}
                  value={orderDetails.notes}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="text-sm min-h-[60px]"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3">
              <Button
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 h-9 text-sm"
              >
                {t('pos.cancel')}
              </Button>
              <Button
                onClick={processPayment}
                disabled={isProcessing || (paymentMethod === 'cash' && (parseFloat(cashReceived) < cartTotal || !cashReceived))}
                className="flex-1 h-9 text-sm"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    {t('pos.processing')}
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {t('pos.confirmPayment')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="max-w-[95vw] rounded-lg sm:max-w-md mx-2">
            <DialogHeader>
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Check className="w-5 h-5" />
                <DialogTitle className="text-lg">{t('pos.orderSuccess')}</DialogTitle>
              </div>
            </DialogHeader>

            <div className="text-center space-y-3">
              <div className="p-3 bg-green-50 rounded">
                <p className="text-xs text-gray-600 mb-1">{t('pos.orderNumber')}</p>
                <p className="text-xl font-bold">#{lastOrderNumber}</p>
              </div>
              <p className="text-sm text-gray-600">{t('pos.orderSuccessMessage')}</p>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsSuccessModalOpen(false)} className="w-full h-9">
                {t('pos.newOrder')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};