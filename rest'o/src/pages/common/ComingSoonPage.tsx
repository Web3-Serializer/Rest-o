import React from 'react';
import { useTranslation } from 'react-i18next';

interface ComingSoonPageProps {
  title?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 p-4">
        <h1 className="text-4xl font-bold">
          {title ? title : t('comingSoon.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('comingSoon.message')}
        </p>
        <p className="text-2xl">🚧</p>
      </div>
    </div>
  );
};