// src/contexts/FavoritesContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { 
  fetchFavorites, 
  addToFavorites, 
  removeFromFavorites, 
  clearAllFavorites,
  FavoriteProduct,
} from '@/services/favorites';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  isLoading: boolean;
  isMutating: boolean;
  total: number;
  addFavorite: (productId: string | number) => Promise<boolean>;
  removeFavorite: (productId: string | number) => Promise<boolean>;
  toggleFavorite: (productId: string | number, currentState?: boolean) => Promise<boolean>;
  clearAllFavorites: () => Promise<boolean>;
  refetch: () => Promise<void>;
  isFavorite: (productId: string | number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [total, setTotal] = useState(0);
  
  const favoritesMapRef = useRef<Map<string, boolean>>(new Map());
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetchFavorites(1, 100);
      
      if (response.result === true && response.data && Array.isArray(response.data.favorites)) {
        const validFavorites = response.data.favorites.filter((item: FavoriteProduct) => item && item.id);
        
        if (isMountedRef.current) {
          setFavorites([...validFavorites]);
          setTotal(validFavorites.length);
          
          const newMap = new Map<string, boolean>();
          validFavorites.forEach((item: FavoriteProduct) => {
            if (item && item.id) {
              newMap.set(item.id.toString(), true);
            }
          });
          favoritesMapRef.current = newMap;
        }
      }
    } catch (error) {
      console.error('خطأ في جلب المفضلة:', error);
    } finally {
      if (showLoading && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  const addFavorite = async (productId: string | number): Promise<boolean> => {
    setIsMutating(true);
    const productIdStr = productId.toString();
    
    try {
      const response = await addToFavorites(productId);
      
      if (response.result === true && response.data) {
        toast.success(t('favorites.addSuccess'));
        
        // إعادة جلب البيانات بالكامل للتأكد من التزامن
        await fetchData(false);
        
        return true;
      } else {
        if (response.message === "هذا المنتج موجود بالفعل في مفضلتك.") {
          toast.success(t('favorites.alreadyExists'));
          favoritesMapRef.current.set(productIdStr, true);
          return true;
        }
        toast.error(response.message || t('favorites.addFailed'));
        return false;
      }
    } catch (error) {
      toast.error(t('favorites.loginRequired'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const removeFavorite = async (productId: string | number): Promise<boolean> => {
    setIsMutating(true);
    const productIdStr = productId.toString();
    
    try {
      const response = await removeFromFavorites(productId);
      
      if (response.result === true) {
        toast.success(t('favorites.removeSuccess'));
        
        // إعادة جلب البيانات بالكامل للتأكد من التزامن
        await fetchData(false);
        
        return true;
      } else {
        toast.error(response.message || t('favorites.removeFailed'));
        return false;
      }
    } catch (error) {
      toast.error(t('favorites.removeError'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const toggleFavorite = async (productId: string | number, currentState?: boolean): Promise<boolean> => {
    const productIdStr = productId.toString();
    const isCurrentlyFavorite = currentState !== undefined ? currentState : (favoritesMapRef.current.get(productIdStr) || false);
    
    if (isCurrentlyFavorite) {
      return await removeFavorite(productId);
    } else {
      return await addFavorite(productId);
    }
  };

  const clearAll = async (): Promise<boolean> => {
    setIsMutating(true);
    try {
      const success = await clearAllFavorites();
      if (success) {
        toast.success(t('favorites.clearAllSuccess'));
        await fetchData(false);
        return true;
      } else {
        toast.error(t('favorites.clearAllFailed'));
        return false;
      }
    } catch (error) {
      toast.error(t('favorites.clearAllError'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const isFavorite = (productId: string | number): boolean => {
    if (!productId) return false;
    return favoritesMapRef.current.get(productId.toString()) || false;
  };

  const value = {
    favorites,
    isLoading,
    isMutating,
    total,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites: clearAll,
    refetch: () => fetchData(true),
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}