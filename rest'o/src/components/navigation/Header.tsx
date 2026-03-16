import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, UtensilsCrossed, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Badge } from "@/components/ui/badge"
import { useRestaurant } from '@/contexts/RestaurantContext';

interface NavLink {
  to: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}

const languages = [
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'es', label: 'Spanish', flag: 'https://flagcdn.com/w40/es.png' }
];


export const Header = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { restaurant } = useRestaurant();

  const restaurantName = restaurant?.name ?? "Rest'o";

  const navLinks: NavLink[] = user
    ? [
        { to: '/', label: t('header.logout'), onClick: logout, icon: LogOut },
      ]
    : [
        { to: '/login', label: t('header.login'), icon: LogIn },
        { to: '/register', label: t('header.register'), icon: UserPlus },
      ];

  const handleLinkClick = (link: NavLink) => {
    setIsOpen(false);
    link.onClick?.();
  };

  const changeLanguage = (lang: string) => i18n.changeLanguage(lang);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 pr-3">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {restaurantName}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={link.onClick}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-accent/50"
            >
              {link.label}
            </Link>
          ))}
          <Select value={i18n.language} onValueChange={changeLanguage}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Lang" />
            </SelectTrigger>
            <SelectContent className="w-40">
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="flex items-center gap-2">
                  <img src={lang.flag} alt={lang.label} className="w-5 h-3 object-cover" />
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>

          <SheetContent side="bottom" className="p-0 mt-14 rounded-t-lg max-h-[80vh]">
            {user && (
              <div className="p-4 border-b bg-muted/30">
                <p className="font-medium text-sm text-foreground">{user.name} <Badge>{t(`roles.${user.role}`)}</Badge></p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
              </div>
            )}

            <nav className="p-2 flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => handleLinkClick(link)}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 mt-4">
              <Select value={i18n.language} onValueChange={changeLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Lang" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {languages.map((lang) => (
                    <SelectItem
                      key={lang.code}
                      value={lang.code}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <img src={lang.flag} alt={lang.label} className="w-5 h-3 object-cover" />
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="absolute bottom-2 left-4 right-4">
              <p className="text-[10px] text-center text-muted-foreground/60">
                {t('header.copyright', { year: new Date().getFullYear() })}
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
