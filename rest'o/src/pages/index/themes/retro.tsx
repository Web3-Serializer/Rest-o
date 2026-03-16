import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import {
  Menu
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

interface RetroThemeProps {
  restaurant: Restaurant;
  menus?: Menu[];
}

const pixelStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  .pixel-font { font-family: 'Press Start 2P', cursive; image-rendering: pixelated; image-rendering: crisp-edges; }
  .scanlines { background: repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px); pointer-events: none; }
  @keyframes pixelFloat { 0%,100%{transform:translateY(0px);}50%{transform:translateY(-20px);} }
  .pixel-float { animation: pixelFloat 3s ease-in-out infinite; }
  @keyframes pixelPulse { 0%,100%{box-shadow:0 0 10px #00ff00,0 0 20px #00ff00;}50%{box-shadow:0 0 5px #00ff00;} }
  .pixel-pulse { animation: pixelPulse 1s ease-in-out infinite; }
  @keyframes glitch { 0%{text-shadow:-2px 0 #ff00ff,2px 0 #00ffff;}50%{text-shadow:2px 0 #ff00ff,-2px 0 #00ffff;}100%{text-shadow:-2px 0 #ff00ff,2px 0 #00ffff;} }
  .pixel-glitch { animation: glitch 0.3s ease-in-out; }
`;

export const RetroTheme = ({ restaurant, menus }: RetroThemeProps) => {
  void menus;
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = pixelStyle;
    document.head.appendChild(style);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white overflow-hidden">
      <div className="scanlines fixed inset-0 pointer-events-none z-40"></div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-indigo-950/95 backdrop-blur-sm border-b-4 border-cyan-400 py-3'
          : 'bg-indigo-900/80 py-4 border-b-4 border-purple-500'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center relative z-10">
          <span className="pixel-font text-sm md:text-base text-cyan-400" style={{ textShadow: '2px 2px 0 #ff00ff' }}>
            {restaurant.name.slice(0, 15)}
          </span>
          <div className="hidden md:flex space-x-4 pixel-font text-xs">
            <Link to="/menus" className="text-purple-300 hover:text-cyan-400 transition-colors duration-200">{t('landing.navigation.menu')}</Link>
            <Link to="/reservations" className="text-purple-300 hover:text-cyan-400 transition-colors duration-200">{t('landing.navigation.book')}</Link>
            <Link to="/orders" className="text-purple-300 hover:text-cyan-400 transition-colors duration-200">{t('landing.navigation.orders')}</Link>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild size="sm" className="bg-cyan-400 hover:bg-cyan-300 text-indigo-900 font-black px-4 py-2 rounded-none border-4 border-purple-500 transition-all duration-200 shadow-lg pixel-font text-xs hover:shadow-cyan-400/50">
              <Link to="/reservations">{t('landing.cta.bookTable')}</Link>
            </Button>
            <button className="md:hidden p-2 text-cyan-400 border-2 border-purple-500 hover:bg-purple-600 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-5 h-5"/>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 py-3 bg-indigo-950/95 border-t-4 border-cyan-400 mx-4 rounded-none">
            <div className="flex flex-col space-y-2 px-4 pixel-font text-xs">
              <Link to="/menus" className="text-purple-300 hover:text-cyan-400 transition-colors duration-200 py-2" onClick={() => setMobileMenuOpen(false)}>{t('landing.navigation.menu')}</Link>
              <Link to="/reservations" className="text-purple-300 hover:text-cyan-400 transition-colors duration-200 py-2" onClick={() => setMobileMenuOpen(false)}>{t('landing.navigation.book')}</Link>
              <Link to="/orders" className="text-purple-300 hover:text-cyan-400 transition-colors duration-200 py-2" onClick={() => setMobileMenuOpen(false)}>{t('landing.navigation.orders')}</Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-black"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="pixel-font text-3xl md:text-5xl lg:text-6xl mb-6 text-cyan-400 leading-tight" style={{ textShadow: '4px 4px 0 #ff00ff, 8px 8px 0 rgba(255,0,255,0.5)' }}>
            {restaurant.name}
          </h1>
          <p className="pixel-font text-xs md:text-sm text-purple-300 mb-12 max-w-2xl mx-auto leading-relaxed px-4 border-2 border-purple-500 p-4 bg-purple-950/50">
            {restaurant.description || t('landing.defaultDescription')}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-b from-purple-950 to-indigo-950 border-y-4 border-purple-500">
        <div className="container mx-auto px-4">
          <h2 className="pixel-font text-xl md:text-3xl text-cyan-400 mb-4 text-center mb-15">{t('landing.information.practicalInfo')}</h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            <Card className="bg-black border-4 border-purple-500 hover:border-cyan-400 shadow-lg">
              <CardContent>
                <h3 className="pixel-font text-xs text-cyan-400">{t('landing.information.hours')}</h3>
                {restaurant.openingHours && (
                    <div className="space-y-2">
                        {Object.entries(restaurant.openingHours).map(([day, hours]: [string, any]) => (
                        <div
                            key={day}
                            className="flex justify-between items-center text-xs md:text-sm border-b border-purple-700 pb-2 last:border-b-0 pixel-font"
                        >
                            <span className="capitalize text-purple-300 font-medium">
                            {t(`days.${day}`)}
                            </span>
                            <div className="text-right">
                            {hours.isOpen ? (
                                <span className="text-cyan-400 font-medium">
                                {hours.open} - {hours.close}
                                </span>
                            ) : (
                                <span className="text-red-500 font-medium">
                                {t('landing.information.closed')}
                                </span>
                            )}
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
              </CardContent>
            </Card>

            <Card className="bg-black border-4 border-purple-500 hover:border-cyan-400 shadow-lg">
              <CardContent>
                <h3 className="pixel-font text-xs text-cyan-400">{t('landing.information.address')}</h3>
                <p className="text-purple-300 text-xs font-mono">{restaurant.address}</p>
              </CardContent>
            </Card>

            <Card className="bg-black border-4 border-purple-500 hover:border-cyan-400 shadow-lg">
              <CardContent>
                <h3 className="pixel-font text-xs text-cyan-400">{t('landing.information.contact')}</h3>
                <p className="text-purple-300 text-xs font-mono">{restaurant.phone}</p>
                <p className="text-purple-300 text-xs font-mono">{restaurant.email}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-black border-t-4 border-cyan-400">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 md:p-8 border-4 border-cyan-400 max-w-3xl mx-auto shadow-lg">
            <h2 className="pixel-font text-xs md:text-sm text-cyan-400 mb-4">{t('landing.cta.title')}</h2>
            <p className="pixel-font text-xs text-purple-300 mb-6">{t('landing.cta.description')}</p>
            <Button asChild size="lg" className="bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-black font-black px-8 py-6 rounded-none border-4 border-purple-500 shadow-lg hover:shadow-cyan-400/50">
              <Link to="/reservations">{t('landing.cta.button')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t-4 border-purple-500 py-6 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="pixel-font text-xs text-cyan-400 mb-2">{t('landing.footer.copy', { year: new Date().getFullYear() })}</p>
          <p className="pixel-font text-xs text-purple-400">{t('landing.footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
};
