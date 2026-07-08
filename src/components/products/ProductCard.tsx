// src/components/products/ProductCard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCartContext } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ColorOption {
  color: string;
  name: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: ColorOption[];
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
  variantId?: number | null;
  hasVariants?: boolean;
  variants?: Array<{ id: number }>;
}

// ✅ دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      loginRequired: "Please login first to add products to favorites",
      errorAdding: "Error adding to favorites",
      bestSeller: "Best Seller",
      quickView: "Quick View",
      addToCart: "Add to Cart",
      removeFromFavorites: "Remove from favorites",
      addToFavorites: "Add to favorites",
    };
  }
  // Arabic (default)
  return {
    loginRequired: "يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة",
    errorAdding: "حدث خطأ أثناء إضافة المنتج إلى المفضلة",
    bestSeller: "الاكثر طلبا",
    quickView: "معاينة سريعة",
    addToCart: "أضف إلى السلة",
    removeFromFavorites: "إزالة من المفضلة",
    addToFavorites: "إضافة إلى المفضلة",
  };
};

export function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  hoverImage,
  href,
  originalPrice,
  discount,
  colors = [],
  rating = 0,
  reviewsCount = 0,
  isBestSeller,
  variantId = null,
  hasVariants = false,
  variants = [],
}: ProductCardProps) {
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [isLocalMutating, setIsLocalMutating] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const { addItem, isLoading: cartLoading } = useCartContext();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const isProductFavorite = isFavorite(id);
  const [localFavorite, setLocalFavorite] = useState(isProductFavorite);

  useEffect(() => {
    setLocalFavorite(isProductFavorite);
  }, [isProductFavorite]);

  // ✅ دالة المفضلة مع التحقق (تتطلب تسجيل دخول)
  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // التحقق من تسجيل الدخول
    if (!isAuthenticated) {
      toast.error(t.loginRequired, {
        duration: 3000,
        position: "top-center",
        icon: "❤️",
      });
      
      const currentUrl = window.location.href;
      router.push(`/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    if (isLocalMutating || isLoading) return;
    
    setIsLocalMutating(true);
    const previousState = localFavorite;
    setLocalFavorite(!previousState);
    
    const success = await toggleFavorite(id, previousState);
    
    if (!success) {
      setLocalFavorite(previousState);
      toast.error(t.errorAdding, {
        duration: 3000,
        position: "top-center",
      });
    }
    
    setIsLocalMutating(false);
  }, [id, name, localFavorite, isLocalMutating, isLoading, toggleFavorite, isAuthenticated, router, t]);

  // ✅ دالة الإضافة إلى السلة (تدعم الضيوف - بدون تسجيل دخول)
  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart || cartLoading) return;
    
    const productId = parseInt(id);
    const quantity = 1;
    
    if (hasVariants && variants.length > 0) {
      const firstVariantId = variants[0].id;
      
      setIsAddingToCart(true);
      try {
        const success = await addItem(productId, quantity, firstVariantId);
        if (success) {
          // ✅ تمت الإضافة بنجاح
        }
      } catch (error) {
        console.error("❌ Error adding to cart:", error);
      } finally {
        setIsAddingToCart(false);
      }
      return;
    }
    
    setIsAddingToCart(true);
    try {
      const finalVariantId = variantId || null;
      const success = await addItem(productId, quantity, finalVariantId);
      if (success) {
        // ✅ تمت الإضافة بنجاح
      }
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [id, name, variantId, hasVariants, variants, isAddingToCart, cartLoading, addItem]);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  
    router.push(`/product/${id}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverImage) {
      setCurrentImage(hoverImage);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImage(image);
  };

  return (
    <div
      role="article"
      aria-labelledby={`product-name-${id}`}
      className="group w-full h-full sm:w-[150px] sm:h-[220px] md:w-[308px] md:h-[386px] relative bg-white transition-all duration-300 hover:shadow-lg"
      style={{
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 0'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href} className="block h-full" aria-label={`عرض تفاصيل ${name}`}>
        {/* Image Container */}
        <div 
          className="relative min-w-[130px] min-h-[130px] md:w-[276px] md:h-[276px] mx-auto transition-colors duration-300"
          style={{
            borderRadius: '8px',
          }}
        >
          {/* Heart Icon - Top Left Corner (موبايل فقط) */}
          <button
            onClick={handleFavoriteClick}
            disabled={isLocalMutating || isLoading}
            className="block md:hidden absolute top-[-5px] left-1 z-10 bg-white rounded-full p-1.5 shadow-md hover:bg-blue-50 transition-all duration-200 hover:scale-110 disabled:opacity-50"
            style={{ color: localFavorite ? '#ef4444' : '#112B40' }}
            aria-label={localFavorite ? t.removeFromFavorites : t.addToFavorites}
            aria-pressed={localFavorite}
          >
            {isLocalMutating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
            ) : (
              <Heart className="h-4 w-4" fill={localFavorite ? '#ef4444' : 'none'} />
            )}
          </button>

          {/* Best Seller Badge */}
          {isBestSeller && (
            <div className="absolute top-2 right-2 z-10">
              <p className="text-[9px] sm:text-xs font-bold text-white bg-[#FF7700] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {t.bestSeller}
              </p>
            </div>
          )}
          
          {discount && discount > 0 && (
            <div className="absolute top-10 right-2 z-10">
              <p className="text-[9px] sm:text-xs font-bold text-[#195073] bg-[#FFDB00] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {discount}% OFF
              </p>
            </div>
          )}

          <Image
            src={currentImage}
            alt={name}
            loading="eager"
            fill
            className="object-contain w-full md:p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 99vw, (max-width: 1200px) 50vw, 33vw"
            quality={100}
            priority={true}
            unoptimized={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCQAA//Z"
          />

          {/* الطبقة المظللة التي تظهر عند hover */}
          {isHovered && (
            <div 
              className="absolute inset-0 rounded-[8px] transition-colors duration-300 pointer-events-none"
              style={{ backgroundColor: '#0000001A' }}
            />
          )}

          {/* Icons Overlay - appears at bottom center on hover */}
          {isHovered && (
            <div className="absolute bottom-3 left-0 right-0 justify-center -translate-y-1/2 flex gap-2 animate-in fade-in zoom-in-95 pointer-events-auto">
              {/* Eye Icon - Quick View */}
              <button
                onClick={handleQuickView}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-[#23A6F0] transition-all duration-200 hover:scale-110"
                style={{ color: '#112B40' }}
                aria-label={t.quickView}
              >
                <Eye className="h-5 w-5 hover:text-white" />
              </button>

              {/* Shopping Cart Icon - Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || cartLoading}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-[#23A6F0] transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: '#112B40' }}
                aria-label={t.addToCart}
              >
                {isAddingToCart ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#23A6F0]" />
                ) : (
                  <ShoppingCart className="h-5 w-5 hover:text-white" />
                )}
              </button>

              {/* Heart Icon - Add to Favorites (ديسكتوب فقط - يتطلب تسجيل دخول) */}
              <button
                onClick={handleFavoriteClick}
                disabled={isLocalMutating || isLoading}
                className="bg-white md:block hidden rounded-full p-2 shadow-lg hover:bg-[#23A6F0] transition-all duration-200 hover:scale-110 disabled:opacity-50"
                style={{ color: localFavorite ? '#ef4444' : '#112B40' }}
                aria-label={localFavorite ? t.removeFromFavorites : t.addToFavorites}
              >
                {isLocalMutating ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
                ) : (
                  <Heart className="h-5 w-5 hover:text-white" fill={localFavorite ? '#ef4444' : 'none'} />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 mt-3">
          {/* Product Name */}
          <h3 className="text-xs md:text-sm font-medium line-clamp-1 mb-1" style={{ color: '#112B40' }}>
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-1 text-sm">
            {originalPrice && originalPrice > price ? (
              <>
                <span className="text-xs md:text-sm line-through text-gray-400 relative">
                  {originalPrice.toLocaleString()} 
                </span>
                <span className="text-xs md:text-sm font-semibold relative" style={{ color: '#23A6F0' }}>
                  {price.toLocaleString()} EGP
                </span>
              </>
            ) : (
              <span className="text-xs md:text-sm font-semibold relative" style={{ color: '#23A6F0' }}>
                {price.toLocaleString()} EGP
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}