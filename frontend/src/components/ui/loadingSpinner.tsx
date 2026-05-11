import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface LoadingSpinnerProps {
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ color = 'text-primary' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin">
        <UtensilsCrossed className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );
};
