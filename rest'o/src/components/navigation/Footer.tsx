import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-4">
        <p className="text-sm text-muted-foreground text-center">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:text-primary transition-colors"
          >
          </Button>
        </div>
      </div>
    </footer>
  );
};