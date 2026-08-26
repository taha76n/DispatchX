import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthData } from "./AuthContext";

export interface RestaurantOption {
  _id: string;
  name: string;
  isOpen: boolean;
}

interface SelectedRestaurantContextType {
  restaurants: RestaurantOption[];
  fetchMyRestaurants: () => void;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: React.Dispatch<React.SetStateAction<string | null>>;
  loading: boolean;
}



export const SelectedRestaurantContext =
  createContext<SelectedRestaurantContextType | null>(null);

interface ProviderProps {
  children: React.ReactNode;
}

export const SelectedRestaurantProvider = ({ children }: ProviderProps) => {
  const { user } = useAuthData();
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);

  const fetchMyRestaurants = async () => {
    try {
      setLoading(true);
      const { restaurants } = await api.get("/restaurant/mine");
      setRestaurants(restaurants);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (user?.role === "restaurant") {
      fetchMyRestaurants();
    }
  }, [user]);

  return (
    <SelectedRestaurantContext.Provider
      value={{
        restaurants,
        selectedRestaurantId,
        fetchMyRestaurants,
        setSelectedRestaurantId,
        loading,
      }}
    >
      {children}
    </SelectedRestaurantContext.Provider>
  );
};

export const useSelectedRestaurantData = () => {
  const context = useContext(SelectedRestaurantContext);
  if (!context) {
    throw new Error(`Selected restaurant context is missing in useContext`);
  }
  return context;
};
