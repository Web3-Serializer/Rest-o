import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import {
  Clock, MapPin, Phone, Utensils, Calendar, Menu, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Restaurant {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  openingHours: any;
  isActive: boolean;
  isOpen: boolean;
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

interface FastFoodThemeProps {
  restaurant: Restaurant;
  menus?: Menu[];
}

const fadeIn = 'animate-fadeIn transition-all duration-500 ease-out';

export const FastFoodTheme = ({ restaurant, menus }: FastFoodThemeProps) => {
  void menus;
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCurrentDaySchedule = () => {
    if (!restaurant?.openingHours) return null;
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today = days[new Date().getDay()];
    return restaurant.openingHours[today];
  };

  const todaySchedule = getCurrentDaySchedule();

  return (
    <div className={`min-h-screen bg-white ${fadeIn}`}>
      
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md py-3 border-b border-gray-100'
          : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
            scrolled ? 'text-red-600' : 'text-white'
          }`}>{restaurant.name}</span>
          
          <div className="hidden md:flex space-x-8">
            <Link 
              to="/menus" 
              className={`font-medium text-sm uppercase tracking-wide transition-colors duration-200 ${
                scrolled ? 'text-gray-700 hover:text-red-600' : 'text-white hover:text-yellow-300'
              }`}
            >
              {t('landing.navigation.menu')}
            </Link>
            <Link 
              to="/reservations" 
              className={`font-medium text-sm uppercase tracking-wide transition-colors duration-200 ${
                scrolled ? 'text-gray-700 hover:text-red-600' : 'text-white hover:text-yellow-300'
              }`}
            >
              {t('landing.navigation.reservations')}
            </Link>
            <Link 
              to="/orders" 
              className={`font-medium text-sm uppercase tracking-wide transition-colors duration-200 ${
                scrolled ? 'text-gray-700 hover:text-red-600' : 'text-white hover:text-yellow-300'
              }`}
            >
              {t('landing.navigation.orders')}
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 rounded-lg transition-all duration-200 shadow-sm">
              <Link to="/reservations">{t('landing.makeReservation')}</Link>
            </Button>
            <button 
              className="md:hidden p-2 transition-colors duration-200" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className={`w-5 h-5 ${scrolled ? 'text-gray-700' : 'text-white'}`}/>
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 py-4 bg-white rounded-lg mx-4 shadow-lg border border-gray-100">
            <div className="flex flex-col space-y-2 px-4">
              <Link 
                to="/menus" 
                className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium text-sm uppercase tracking-wider py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('landing.navigation.menu')}
              </Link>
              <Link 
                to="/reservations" 
                className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium text-sm uppercase tracking-wider py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('landing.navigation.reservations')}
              </Link>
              <Link 
                to="/orders" 
                className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium text-sm uppercase tracking-wider py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('landing.navigation.orders')}
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-gradient-to-br from-red-600 to-red-700">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tight">
            {restaurant.name}
          </h1>

          <div className="w-20 h-1 bg-yellow-400 mx-auto mb-8 rounded-full"></div>

          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {restaurant.description || t('landing.defaultDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-red-600 font-semibold px-8 py-6 text-base rounded-lg transition-all duration-200 shadow-lg">
              <Link to="/orders">
                <Zap className="w-5 h-5 mr-2"/>
                {t('landing.cta.orderOnline')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white text-red-600 hover:bg-white hover:text-red-600 font-semibold px-8 py-6 text-base rounded-lg transition-all duration-200">
              <Link to="/menus">
                <Utensils className="w-5 h-5 mr-2"/>
                {t('landing.viewMenu')}
              </Link>
            </Button>
          </div>

          <div className={`inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20`}>
            <div className={`w-2 h-2 rounded-full ${restaurant.isOpen?'bg-green-400':'bg-red-400'} animate-pulse`}></div>
            <span className={`text-sm font-semibold ${restaurant.isOpen?'text-green-300':'text-red-300'}`}>
              {restaurant.isOpen ? t('landing.openNow') : t('landing.closedNow')}
            </span>
            {todaySchedule && restaurant.isOpen && 
              <span className="text-sm text-white/80 font-medium hidden sm:inline">• {todaySchedule.open} - {todaySchedule.close}</span>
            }
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.information.practicalInfo')}
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mb-6 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Clock className="h-5 w-5 text-red-600"/>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('landing.information.hours')}
                  </h3>
                </div>
                <div className="space-y-3">
                  {restaurant.openingHours && Object.entries(restaurant.openingHours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between items-center text-sm border-b border-gray-100 pb-3 last:border-b-0">
                      <span className="capitalize font-medium text-gray-700">
                        {t(`days.${day}`)}
                      </span>
                      <div className="text-right">
                        {hours.isOpen ? (
                          <span className="text-gray-900 font-medium">{hours.open} - {hours.close}</span>
                        ) : (
                          <span className="text-gray-400 font-medium">{t('landing.information.closed')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <MapPin className="h-5 w-5 text-red-600"/>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('landing.information.address')}
                  </h3>
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">{restaurant.address}</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Phone className="h-5 w-5 text-red-600"/>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('landing.information.contact')}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">{restaurant.phone}</p>
                  <p className="text-gray-700 font-medium text-sm">{restaurant.email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
            {t('landing.cta.description')}
          </p>
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-6 rounded-lg transition-all duration-200">
            <Link to="/reservations" className="flex items-center">
              <Calendar className="w-5 h-5 mr-2"/>
              {t('landing.cta.button')}
            </Link>
          </Button>
        </div>
      </section>

      <footer className="bg-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white font-medium mb-2">
            {t('landing.footer.copy', { year: new Date().getFullYear() })}
          </p>
          <p className="text-gray-400 text-sm">{t('landing.footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
};