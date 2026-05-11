import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { restaurantAPI } from "@/services/api.service";

interface Restaurant {
  name: string;
  isActive?: boolean;
  isOpen?: boolean;
  openingHours?: any;
  phone?: string;
  theme?: string;
  email?: string;
  description?: string;
  address?: string;
}

interface RestaurantContextType {
  restaurant: Restaurant | null;
  loading: boolean;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error("useRestaurant must be used inside <RestaurantProvider>");
  }
  return ctx;
};

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("restaurantName");

    if (storedName) {
      setRestaurant({ name: storedName });
      setLoading(false);
      return;
    }

    restaurantAPI
      .getRestaurantStatus()
      .then((res) => {
        const data = res.data;
        if (data?.name) {
          localStorage.setItem("restaurantName", data.name);
        }
        setRestaurant(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = useMemo(
    () => ({ restaurant, loading }),
    [restaurant, loading]
  );

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}
