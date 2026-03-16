import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { 
  Clock, MapPin, Phone, Utensils, Calendar, ChefHat, Sparkles, ArrowRight, Menu 
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
  message?: string;
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

interface DefaultThemeProps {
  restaurant: Restaurant;
  menus: Menu[];
}

const fadeIn = 'animate-fadeIn transition-all duration-1000 ease-out';

export const DefaultTheme = ({ restaurant, menus }: DefaultThemeProps) => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCurrentDaySchedule = () => {
    if (!restaurant?.openingHours) return null;
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today = days[new Date().getDay()];
    return restaurant.openingHours[today];
  };

  const getMenusByCategory = (category: string) =>
    menus.filter(menu => menu.category === category && menu.isAvailable);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appetizer': return <Utensils className="h-5 w-5 md:h-6 md:w-6 text-white" />;
      case 'main': return <ChefHat className="h-5 w-5 md:h-6 md:w-6 text-white" />;
      case 'dessert': return <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />;
      case 'drink': return <span className="text-lg">🍷</span>;
      default: return <Utensils className="h-5 w-5 md:h-6 md:w-6 text-white" />;
    }
  };

  const getCategoryName = (category: string) =>
    t(`menus.categories.${category}`) || category;

  const todaySchedule = getCurrentDaySchedule();
  const categoriesWithMenus = [...new Set(menus.filter(menu => menu.isAvailable).map(menu => menu.category))];

  return (
    <div className={`min-h-screen bg-black text-white ${fadeIn}`}>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-lg border-b border-white/10 py-4' 
          : 'bg-transparent py-6'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="text-xl font-light tracking-widest text-white">{restaurant.name}</span>
          <div className="hidden md:flex space-x-8">
            <Link to="/menus" className="text-gray-300 hover:text-white transition-colors duration-300 font-light text-sm tracking-wider">{t('landing.navigation.menu')}</Link>
            <Link to="/reservations" className="text-gray-300 hover:text-white transition-colors duration-300 font-light text-sm tracking-wider">{t('landing.navigation.reservations')}</Link>
            <Link to="/orders" className="text-gray-300 hover:text-white transition-colors duration-300 font-light text-sm tracking-wider">{t('landing.navigation.orders')}</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild size="sm" className="bg-white hover:bg-gray-100 text-black font-semibold px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-white/25">
              <Link to="/reservations"><Calendar className="w-4 h-4 mr-2"/>{t('landing.makeReservation')}</Link>
            </Button>
            <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu className="w-6 h-6"/></button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/10 bg-black/95 backdrop-blur-lg rounded-lg">
            <div className="flex flex-col space-y-4 ml-5">
              <Link to="/menus" className="text-gray-300 hover:text-white transition-colors duration-300 font-light text-sm tracking-wider py-2" onClick={() => setMobileMenuOpen(false)}>{t('landing.navigation.menu')}</Link>
              <Link to="/reservations" className="text-gray-300 hover:text-white transition-colors duration-300 font-light text-sm tracking-wider py-2" onClick={() => setMobileMenuOpen(false)}>{t('landing.navigation.reservations')}</Link>
              <Link to="/orders" className="text-gray-300 hover:text-white transition-colors duration-300 font-light text-sm tracking-wider py-2" onClick={() => setMobileMenuOpen(false)}>{t('landing.navigation.orders')}</Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center bg-no-repeat opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-6 tracking-tight animate-fadeInUp">
            <div className="leading-tight md:leading-none">
              {restaurant.name}
            </div>
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8 animate-scaleIn"></div>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-fadeInUp delay-300 px-4">{restaurant.description || t('landing.defaultDescription')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp delay-500 px-4">
            <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-black font-semibold px-8 md:px-12 py-6 text-base md:text-lg rounded-full border border-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <Link to="/reservations"><Calendar className="w-5 h-5 md:w-6 md:h-6 mr-3"/>{t('landing.makeReservation')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white/80 text-black hover:bg-white hover:text-black font-semibold px-8 md:px-12 py-6 text-base md:text-lg rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
              <Link to="/menus"><Utensils className="w-5 h-5 md:w-6 md:h-6 mr-3"/>{t('landing.viewMenu')}</Link>
            </Button>
          </div>
          <div className={`mt-16 inline-flex items-center gap-4 bg-black/50 backdrop-blur-sm px-6 py-4 rounded-full border ${restaurant.isOpen?'border-green-500/50':'border-red-500/50'} animate-pulse shadow-2xl`}>
            <div className={`w-2 h-2 rounded-full ${restaurant.isOpen?'bg-green-500':'bg-red-500'} shadow-lg`}></div>
            <span className="text-base font-medium text-white">{restaurant.isOpen?t('landing.openNow'):t('landing.closedNow')}</span>
            {todaySchedule && restaurant.isOpen && <span className="text-sm text-gray-300 hidden sm:inline">• {todaySchedule.open} - {todaySchedule.close}</span>}
          </div>
        </div>
      </section>

      {categoriesWithMenus.length > 0 && (
        <section className="py-20 md:py-24 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 text-white text-sm font-light tracking-wider mb-4">
                <div className="w-4 h-px bg-white"></div>{t('landing.menu.discover')}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6">{t('landing.menu.ourMenu')}</h2>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">{t('landing.menu.description')}</p>
            </div>
            <div className="max-w-7xl mx-auto">
              {categoriesWithMenus.slice(0,2).map(category=>{
                const categoryMenus = getMenusByCategory(category);
                if(categoryMenus.length===0) return null;
                return (
                  <div key={category} className="mb-16 md:mb-20 last:mb-0">
                    <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 md:mb-12">
                      {getCategoryIcon(category)}
                      <h3 className="text-2xl md:text-3xl font-light text-white border-b border-white pb-2 px-6 text-center">{getCategoryName(category)}</h3>
                      {getCategoryIcon(category)}
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                      {categoryMenus.slice(0,4).map(menu=>(
                        <Card key={menu._id} className="bg-gray-900 border border-white/10 hover:border-white/30 transition-all duration-500 group hover:transform hover:scale-105 shadow-2xl hover:shadow-white/10 overflow-hidden">
                          <CardContent className="p-6 md:p-8">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-semibold text-lg md:text-xl text-white group-hover:text-white transition-colors duration-300 flex-1 pr-4">{menu.name}</h4>
                            </div>
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed italic">{menu.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {categoryMenus.length>4 && (
                      <div className="text-center mt-8 md:mt-12">
                        <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded-full group">
                          <Link to="/menus" className="flex items-center">{t('landing.menu.viewAllDishes',{count:categoryMenus.length})}<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/></Link>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-12 md:mt-16">
              <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-black font-semibold px-8 md:px-12 py-6 text-base md:text-lg rounded-full border border-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <Link to="/menus" className="flex items-center"><Utensils className="w-5 h-5 md:w-6 md:h-6 mr-3"/>{t('landing.menu.discoverFullMenu')}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-24 bg-gray-900 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-white text-sm font-light tracking-wider mb-4"><div className="w-4 h-px bg-white"></div>{t('landing.information.title')}</div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">{t('landing.information.practicalInfo')}</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">{t('landing.information.description')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <Card className="bg-black border border-white/10 hover:border-white/30 transition-all duration-500 group hover:transform hover:scale-105">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6 md:mb-8"><div className="p-3 bg-white/10 rounded-2xl"><Clock className="h-6 w-6 md:h-8 md:w-8 text-white"/></div><h3 className="text-xl md:text-2xl font-light text-white">{t('landing.information.hours')}</h3></div>
                <div className="space-y-3 md:space-y-4">
                  {restaurant.openingHours && Object.entries(restaurant.openingHours).map(([day,hours]:[string,any])=>(
                    <div key={day} className="flex justify-between items-center text-sm md:text-base border-b border-white/10 pb-3 last:border-b-0">
                      <span className="capitalize font-medium text-gray-300">{t(`days.${day}`)}</span>
                      <div className="text-right">{hours.isOpen?<span className="text-white font-semibold">{hours.open} - {hours.close}</span>:<span className="text-red-400 font-semibold">{t('landing.information.closed')}</span>}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-white/10 hover:border-white/30 transition-all duration-500 group hover:transform hover:scale-105">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6 md:mb-8"><div className="p-3 bg-white/10 rounded-2xl"><MapPin className="h-6 w-6 md:h-8 md:w-8 text-white"/></div><h3 className="text-xl md:text-2xl font-light text-white">{t('landing.information.address')}</h3></div>
                <p className="text-gray-300">{restaurant.address}</p>
              </CardContent>
            </Card>

            <Card className="bg-black border border-white/10 hover:border-white/30 transition-all duration-500 group hover:transform hover:scale-105">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6 md:mb-8"><div className="p-3 bg-white/10 rounded-2xl"><Phone className="h-6 w-6 md:h-8 md:w-8 text-white"/></div><h3 className="text-xl md:text-2xl font-light text-white">{t('landing.information.contact')}</h3></div>
                <p className="text-gray-300">{restaurant.phone}</p>
                <p className="text-gray-300">{restaurant.email}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">{t('landing.cta.title')}</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">{t('landing.cta.description')}</p>
          <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-black font-semibold px-8 md:px-12 py-6 text-base md:text-lg rounded-full border border-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <Link to="/reservations"><Calendar className="w-5 h-5 md:w-6 md:h-6 mr-3"/>{t('landing.cta.button')}</Link>
          </Button>
        </div>
      </section>

      <footer className="bg-gray-900 border-t border-white/10 py-12">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm md:text-base">
          <p>{t('landing.footer.copy', { year: new Date().getFullYear() })}</p>
          <p>{t('landing.footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
};
