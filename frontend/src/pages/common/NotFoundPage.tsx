import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();



  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 p-4">
        <h1 className="text-6xl font-bold text-red-600">404</h1>
        <h2 className="text-3xl font-semibold">{t('notFound.title')}</h2>
        <p className="text-muted-foreground">{t('notFound.message')}</p>
        <Link
          to="/"
          className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          {t('notFound.goHome')}
        </Link>
      </div>
    </div>
  );
};
