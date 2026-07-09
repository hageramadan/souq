// src/contexts/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef, useMemo } from 'react';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  CartData,
  AddToCartPayload,
  getGuestToken as getGuestTokenFromService,
  setGuestToken as setGuestTokenInService,
  clearGuestToken,
} from '@/services/cart';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface CartContextType {
  cart: CartData | null;
  isLoading: boolean;
  isMutating: boolean;
  itemCount: number;
  totalAmount: number;
  guestToken: string | null;
  isGuest: boolean;
  addItem: (productId: number, quantity: number, variantId?: number | null) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: number) => Promise<boolean>;
  clearAllItems: () => Promise<boolean>;
  refetchCart: () => Promise<void>;
  updateCart: (newCart: CartData | null) => void;
  getItemQuantity: (productId: number) => number;
  setGuestToken: (token: string) => void;
  clearGuestMode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [guestToken, setGuestTokenState] = useState<string | null>(() => {
    // ✅ إذا كان هناك auth_token، لا نستخدم guest_token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        return null;
      }
      return localStorage.getItem('guest_cart_token');
    }
    return null;
  });
  
  const isMountedRef = useRef(true);

  // ✅ التحقق إذا كان المستخدم ضيف
  const isGuest = useMemo(() => {
    // إذا كان هناك auth_token، فالمستخدم ليس ضيف
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        return false;
      }
    }
    
    // إذا كان هناك guest_token وليس هناك user في السلة
    return !!guestToken && !cart?.user;
  }, [guestToken, cart]);

  // ✅ دالة لحفظ الـ guest_token
  const setGuestToken = useCallback((token: string) => {
    // ✅ إذا كان هناك auth_token، لا نحفظ guest_token
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        return;
      }
    }
    
    setGuestTokenState(token);
    setGuestTokenInService(token);
  }, []);

  // ✅ دالة لمسح وضع الضيف
  const clearGuestMode = useCallback(() => {
    clearGuestToken();
    setGuestTokenState(null);
  }, []);

  const fetchCartData = useCallback(async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await getCart();
      
      if (response.result === true && response.data && response.data.cart) {
        const cartData = response.data.cart;
        
        // ✅ حفظ الـ guest_token فقط إذا لم يكن هناك auth_token
        if (cartData.guest_token) {
          const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          if (!authToken) {
            setGuestToken(cartData.guest_token);
          }
        }
        
        if (isMountedRef.current) {
          setCart(cartData);
          setItemCount(cartData.total_quantity || 0);
          setTotalAmount(cartData.total_amount || 0);
        }
      } else {
        if (isMountedRef.current) {
          setCart(null);
          setItemCount(0);
          setTotalAmount(0);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب السلة:', error);
    } finally {
      if (showLoading && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [setGuestToken]);

  const updateCart = useCallback((newCart: CartData | null) => {
    if (!isMountedRef.current) return;
    
    setCart(newCart);
    
    if (newCart) {
      setItemCount(newCart.total_quantity || 0);
      setTotalAmount(newCart.total_amount || 0);
      
      // ✅ حفظ الـ guest_token فقط إذا لم يكن هناك auth_token
      if (newCart.guest_token) {
        const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!authToken) {
          setGuestToken(newCart.guest_token);
        }
      }
    } else {
      setItemCount(0);
      setTotalAmount(0);
    }
  }, [setGuestToken]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCartData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchCartData]);

  const addItem = async (productId: number, quantity: number, variantId?: number | null): Promise<boolean> => {
    setIsMutating(true);
    
    try {
      const payload: AddToCartPayload = {
        product_id: productId,
        quantity: quantity,
        product_variant_id: variantId || null,
      };
      
      const response = await addToCart(payload);
      
      if (response.result === true && response.data) {
        // ✅ حفظ الـ guest_token فقط إذا لم يكن هناك auth_token
        if (response.data.cart?.guest_token) {
          const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          if (!authToken) {
            setGuestToken(response.data.cart.guest_token);
          }
        }
        
        toast.success(response.message || t('cart.addSuccess'));
        await fetchCartData(false);
        return true;
      } else {
        toast.error(response.message || t('cart.addFailed'));
        return false;
      }
    } catch (error) {
      toast.error(t('cart.addError'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number): Promise<boolean> => {
    setIsMutating(true);
    
    try {
      const response = await updateCartItemQuantity(cartItemId, quantity);
      
      if (response.result === true && response.data) {
        toast.success(t('cart.updateSuccess'));
        await fetchCartData(false);
        return true;
      } else {
        toast.error(response.message || t('cart.updateFailed'));
        return false;
      }
    } catch (error) {
      toast.error(t('cart.updateError'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    setIsMutating(true);
    
    try {
      const response = await removeFromCart(cartItemId);
      
      if (response.result === true) {
        toast.success(t('cart.removeSuccess'));
        await fetchCartData(false);
        return true;
      } else {
        toast.error(response.message || t('cart.removeFailed'));
        return false;
      }
    } catch (error) {
      toast.error(t('cart.removeError'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const clearAllItems = async (): Promise<boolean> => {
    setIsMutating(true);
    
    try {
      const response = await clearCart();
      
      if (response.result === true) {
        toast.success(t('cart.clearAllSuccess'));
        await fetchCartData(false);
        return true;
      } else {
        toast.error(response.message || t('cart.clearAllFailed'));
        return false;
      }
    } catch (error) {
      toast.error(t('cart.clearAllError'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const getItemQuantity = (productId: number): number => {
    if (!cart || !cart.items) return 0;
    
    const item = cart.items.find(item => item.product.id === productId);
    return item?.quantity || 0;
  };

  const value = {
    cart,
    isLoading,
    isMutating,
    itemCount,
    totalAmount,
    guestToken,
    isGuest,
    addItem,
    updateQuantity,
    removeItem,
    clearAllItems,
    refetchCart: () => fetchCartData(true),
    updateCart,
    getItemQuantity,
    setGuestToken,
    clearGuestMode,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}