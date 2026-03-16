import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import { Toaster } from "@/components/ui/sonner"
import './i18n';
import { RestaurantProvider } from './contexts/RestaurantContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RestaurantProvider>
        <AppRouter />
        <Toaster />
      </RestaurantProvider>
    </AuthProvider>
  </React.StrictMode>,
);