import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { restaurantAPI, menuAPI } from '@/services/api.service';

import { DefaultTheme } from './themes/default';
import { FastFoodTheme } from './themes/fastfood';
import { RetroTheme } from './themes/retro';

interface Restaurant {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  openingHours: any;
  isActive: boolean;
  isOpen: boolean;
  theme?: string;
}

interface Menu {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  image?: string;
}

export const IndexPage = () => {
  const { t } = useTranslation();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [restaurantRes, menusRes] = await Promise.all([
          restaurantAPI.getRestaurantStatus(),
          menuAPI.getAll()
        ]);
        if (restaurantRes.success) setRestaurant(restaurantRes.data);
        if (menusRes.success) setMenus(menusRes.data.menus || menusRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner color="text-white" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8 bg-gray-900 rounded-2xl shadow-2xl border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-4">{t('landing.errorTitle')}</h1>
          <p className="text-gray-300">{t('landing.errorDescription')}</p>
        </div>
      </div>
    );
  }

  const ThemeComponent = (() => {
    switch (restaurant.theme) {
      case 'fastfood':
        return FastFoodTheme;
      case 'retro':
        return RetroTheme;
      default:
        return DefaultTheme;
    }
  })();

  return <ThemeComponent restaurant={restaurant} menus={menus} />;
};
