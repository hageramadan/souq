// components/home/YouMayAlsoLike.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import {
  getMostSellingProducts,
  getNewProducts,
  ProductData,
  getAllProducts,
} from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { HiArrowNarrowLeft, HiOutlineArrowNarrowRight } from "react-icons/hi";

// ✅ تعريف واجهات الفاريانتات
interface VariantAttribute {
  id: number;
  attribute_type: {
    id: number;
    name: string;
  };
  value: string;
  meta: {
    color?: string;
  } | null;
}

interface ProductVariant {
  id: number;
  sku: string | null;
  price: number;
  has_discount: boolean;
  discount_type: string | null;
  discount_value: number | null;
  price_after_discount: number;
  quantity: number | null;
  is_active: boolean;
  variant_image: string | null;
  attributes: VariantAttribute[];
}

// ✅ تحديث واجهة Product لإضافة خصائص الفاريانتات
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: Array<{ color: string; name: string }>;
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  variantId?: number | null;
}

// ✅ دالة استخراج الألوان من جميع الـ variants
const extractColorsFromVariants = (
  variants: ProductVariant[],
): Array<{ color: string; name: string }> => {
  const colorMap = new Map<string, string>();

  if (!variants || variants.length === 0) return [];

  variants.forEach((variant) => {
    if (variant.attributes && Array.isArray(variant.attributes)) {
      variant.attributes.forEach((attr: VariantAttribute) => {
        if (
          attr.attribute_type?.name === "اللون" &&
          attr.value &&
          attr.meta?.color
        ) {
          if (!colorMap.has(attr.value)) {
            colorMap.set(attr.value, attr.meta.color);
          }
        }
      });
    }
  });

  return Array.from(colorMap.entries()).map(([name, color]) => ({
    name: name,
    color: color,
  }));
};

// ✅ دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === "en") {
    return {
      youMayAlsoLike: "You May Also Like",
      viewMore: "View More",
      loading: "Loading products...",
      noProducts: "No products available",
      failedToLoad: "Failed to load products",
    };
  }
  return {
    youMayAlsoLike: "قد يعجبك أيضاً",
    viewMore: "عرض المزيد",
    loading: "جاري تحميل المنتجات...",
    noProducts: "لا توجد منتجات حالياً",
    failedToLoad: "فشل في تحميل المنتجات",
  };
};

// ✅ تحويل البيانات من API إلى شكل المنتج المطلوب مع دعم الفاريانتات
const transformProduct = (product: ProductData): Product => {
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://admin.souqkaber.com${url}`;
    }
    return `https://admin.souqkaber.com${url}`;
  };

  const mainImage =
    product.images && product.images.length > 0
      ? cleanImageUrl(product.images[0])
      : "/images/placeholder.jpg";

  const hoverImage =
    product.images && product.images.length > 1
      ? cleanImageUrl(product.images[1])
      : mainImage;

  let discount: number | undefined;
  let originalPrice: number | undefined;

  if (product.pricing.has_discount && product.pricing.price_after_discount) {
    discount = Math.round(
      ((product.pricing.price - product.pricing.price_after_discount) /
        product.pricing.price) *
        100,
    );
    originalPrice = product.pricing.price;
  }

  let colors: Array<{ color: string; name: string }> = [];
  let hasVariants = false;
  let variants: ProductVariant[] = [];
  let variantId: number | null = null;

  if (product.has_variants && product.variants && product.variants.length > 0) {
    hasVariants = true;
    variants = product.variants as ProductVariant[];
    variantId = product.variants[0].id;
    colors = extractColorsFromVariants(product.variants as ProductVariant[]);
  }

  return {
    id: product.id.toString(),
    name: product.name,
    price: product.pricing.final_price,
    image: mainImage,
    hoverImage: hoverImage,
    href: `/product/${product.id}`,
    originalPrice: originalPrice,
    discount: discount,
    colors: colors,
    rating: product.avg_rating || 0,
    reviewsCount: product.total_reviews || 0,
    isBestSeller: product.is_active,
    hasVariants: hasVariants,
    variants: variants,
    variantId: variantId,
  };
};

// دالة لخلط المنتجات عشوائياً
const shuffleProducts = (products: Product[]): Product[] => {
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function YouMayAlsoLike() {
  const { language } = useLanguage();
  const t = getTranslations(language);
  const isRTL = language === "ar";

  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4.5);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [maxIndex, setMaxIndex] = useState(0);

  const isMounted = useRef(true);
  const fetchingRef = useRef(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const velocityRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startTranslateRef = useRef(0);

  // جلب المنتجات من API
  const fetchProducts = useCallback(async () => {
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      setIsInitialLoading(true);

      let productsData: ProductData[] = [];

      try {
        productsData = await getMostSellingProducts(1, 20);

        if (productsData.length === 0) {
          productsData = await getNewProducts(1, 20);
        }

        if (productsData.length === 0) {
          const { products: allProducts } = await getAllProducts({
            page: 1,
            per_page: 20,
          });
          productsData = allProducts;
        }
      } catch (err) {
        console.error(
          "Error fetching from most selling, trying new products:",
          err,
        );
        productsData = await getNewProducts(1, 20);
      }

      if (!isMounted.current) return;

      if (productsData.length === 0) {
        setProducts([]);
        return;
      }

      let transformedProducts = productsData.map(transformProduct);
      transformedProducts = shuffleProducts(transformedProducts);
      setProducts(transformedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      if (!isMounted.current) return;
      setError(t.failedToLoad);
      setProducts([]);
    } finally {
      if (!isMounted.current) return;
      setIsInitialLoading(false);
      fetchingRef.current = false;
    }
  }, [t.failedToLoad]);

  // تحديث عدد العناصر المعروضة حسب حجم الشاشة
  const updateItemsPerView = useCallback(() => {
    if (typeof window === "undefined") return;

    const width = window.innerWidth;
    if (width < 640) {
      setItemsPerView(2);
    } else if (width < 1024) {
      setItemsPerView(3);
    } else {
      setItemsPerView(4.5);
    }
  }, []);

  // حساب max index
  const calculateMaxIndex = useCallback(() => {
    if (products.length === 0 || itemsPerView === 0) return 0;
    const max = Math.max(0, Math.ceil(products.length - itemsPerView));
    setMaxIndex(max);
    return max;
  }, [products.length, itemsPerView]);

  useEffect(() => {
    isMounted.current = true;

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 100);

    return () => {
      isMounted.current = false;
      window.removeEventListener("resize", updateItemsPerView);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(timeoutId);
    };
  }, [fetchProducts, updateItemsPerView]);

  // تحديث maxIndex بعد تحميل المنتجات
  useEffect(() => {
    if (products.length > 0) {
      setTimeout(() => {
        calculateMaxIndex();
        setCurrentIndex(0);
        setCurrentTranslate(0);
      }, 100);
    }
  }, [products, itemsPerView, calculateMaxIndex]);

  // حساب عرض الكارت الواحد مع المسافات
  const getCardWidthWithGap = useCallback(() => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    const gap = window.innerWidth < 640 ? 8 : 16;
    return (containerWidth - (itemsPerView - 1) * gap) / itemsPerView + gap;
  }, [itemsPerView]);

  // الانتقال لشريحة محددة
  const goToSlide = useCallback(
    (index: number, animate: boolean = true) => {
      const max = calculateMaxIndex();
      const targetIndex = Math.max(0, Math.min(index, max));
      setCurrentIndex(targetIndex);
      const translate = isRTL
        ? targetIndex * getCardWidthWithGap()
        : -targetIndex * getCardWidthWithGap();
      setCurrentTranslate(translate);
      if (animate) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 350);
      }
    },
    [calculateMaxIndex, getCardWidthWithGap, isRTL],
  );

  // التنقل بالسهمين
  const scrollByAmount = useCallback(
    (direction: "left" | "right") => {
      if (isDraggingRef.current) return;
      const max = calculateMaxIndex();
      let newIndex;

      if (direction === "right") {
        newIndex = Math.min(currentIndex + 1, max);
      } else {
        newIndex = Math.max(currentIndex - 1, 0);
      }
      goToSlide(newIndex, true);
    },
    [currentIndex, calculateMaxIndex, goToSlide],
  );

  // سحب بالماوس
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    setStartX(e.pageX);
    lastMoveXRef.current = e.pageX;
    lastMoveTimeRef.current = Date.now();
    velocityRef.current = 0;
    setIsAnimating(false);
    startTranslateRef.current = currentTranslate;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const now = Date.now();
    const deltaX = e.pageX - lastMoveXRef.current;
    const deltaTime = now - lastMoveTimeRef.current;

    if (deltaTime > 0 && deltaTime < 100) {
      velocityRef.current = (deltaX / deltaTime) * 8;
    }

    const diff = e.pageX - startX;
    const cardWidth = getCardWidthWithGap();
    const max = calculateMaxIndex();
    const maxTranslate = isRTL ? max * cardWidth : -max * cardWidth;

    let newTranslate = startTranslateRef.current + diff;
    if (isRTL) {
      if (newTranslate < -20) newTranslate = -20;
      if (newTranslate > maxTranslate + 20) newTranslate = maxTranslate + 20;
    } else {
      if (newTranslate > 20) newTranslate = 20;
      if (newTranslate < maxTranslate - 20) newTranslate = maxTranslate - 20;
    }

    setCurrentTranslate(newTranslate);

    lastMoveXRef.current = e.pageX;
    lastMoveTimeRef.current = now;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const cardWidth = getCardWidthWithGap();
    const max = calculateMaxIndex();

    let currentIndexValue;
    if (isRTL) {
      currentIndexValue = Math.round(currentTranslate / cardWidth);
    } else {
      currentIndexValue = Math.round(-currentTranslate / cardWidth);
    }
    const clampedIndex = Math.max(0, Math.min(currentIndexValue, max));

    if (Math.abs(velocityRef.current) > 2) {
      let nextIndex = clampedIndex;
      if (isRTL) {
        if (velocityRef.current > 1) {
          nextIndex = Math.min(clampedIndex + 1, max);
        } else if (velocityRef.current < -1) {
          nextIndex = Math.max(clampedIndex - 1, 0);
        }
      } else {
        if (velocityRef.current < -1) {
          nextIndex = Math.min(clampedIndex + 1, max);
        } else if (velocityRef.current > 1) {
          nextIndex = Math.max(clampedIndex - 1, 0);
        }
      }
      goToSlide(nextIndex, true);
    } else {
      goToSlide(clampedIndex, true);
    }

    velocityRef.current = 0;
  };

  // سحب باللمس
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    isDraggingRef.current = true;
    setIsDragging(true);
    setStartX(touch.pageX);
    lastMoveXRef.current = touch.pageX;
    lastMoveTimeRef.current = Date.now();
    velocityRef.current = 0;
    setIsAnimating(false);
    startTranslateRef.current = currentTranslate;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !e.touches.length) return;

    const touch = e.touches[0];
    const now = Date.now();
    const deltaX = touch.pageX - lastMoveXRef.current;
    const deltaTime = now - lastMoveTimeRef.current;

    if (deltaTime > 0 && deltaTime < 100) {
      velocityRef.current = (deltaX / deltaTime) * 8;
    }

    const diff = touch.pageX - startX;
    const cardWidth = getCardWidthWithGap();
    const max = calculateMaxIndex();
    const maxTranslate = isRTL ? max * cardWidth : -max * cardWidth;

    let newTranslate = startTranslateRef.current + diff;
    if (isRTL) {
      if (newTranslate < -20) newTranslate = -20;
      if (newTranslate > maxTranslate + 20) newTranslate = maxTranslate + 20;
    } else {
      if (newTranslate > 20) newTranslate = 20;
      if (newTranslate < maxTranslate - 20) newTranslate = maxTranslate - 20;
    }

    setCurrentTranslate(newTranslate);

    lastMoveXRef.current = touch.pageX;
    lastMoveTimeRef.current = now;
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const cardWidth = getCardWidthWithGap();
    const max = calculateMaxIndex();

    let currentIndexValue;
    if (isRTL) {
      currentIndexValue = Math.round(currentTranslate / cardWidth);
    } else {
      currentIndexValue = Math.round(-currentTranslate / cardWidth);
    }
    const clampedIndex = Math.max(0, Math.min(currentIndexValue, max));

    if (Math.abs(velocityRef.current) > 2) {
      let nextIndex = clampedIndex;
      if (isRTL) {
        if (velocityRef.current > 1) {
          nextIndex = Math.min(clampedIndex + 1, max);
        } else if (velocityRef.current < -1) {
          nextIndex = Math.max(clampedIndex - 1, 0);
        }
      } else {
        if (velocityRef.current < -1) {
          nextIndex = Math.min(clampedIndex + 1, max);
        } else if (velocityRef.current > 1) {
          nextIndex = Math.max(clampedIndex - 1, 0);
        }
      }
      goToSlide(nextIndex, true);
    } else {
      goToSlide(clampedIndex, true);
    }

    velocityRef.current = 0;
  };

  if (isInitialLoading) {
    return (
      <section className="py-6 md:py-12 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#2D93CA] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 text-sm animate-pulse">{t.loading}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && products.length === 0) {
    return (
      <section className="py-6 md:py-12 bg-gray-50">
        <div className="container-custom">
          <div className="text-center py-12">
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    products.length > 0 && (
      <section className="py-6 md:py-12 bg-gray-50 overflow-hidden">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-2 md:mb-5 flex justify-between items-center px-1 relative">
            <h2
              className="text-lg md:text-xl font-bold"
              style={{ color: "#112B40" }}
            >
              {t.youMayAlsoLike}
            </h2>
            {/* <Link
              href="/products"
              className="text-[#2D93CA] text-[14px] font-bold hover:underline transition-all duration-300 flex items-center gap-1"
            >
              {t.viewMore}
            </Link> */}
          </div>

          {/* Slider Container */}
          <div className="relative">
            {currentIndex >= 0 && (
              <button
                onClick={() => scrollByAmount("left")}
                dir="rtl"
                className={`${
                  language === "en"
                    ? "end-2 md:end-[-30px]"
                    : "end-2 md:end-[-30px]"
                } absolute top-1/2 md:top-1/2 -translate-y-1/2 z-20 bg-[#23A6F0] hover:bg-[#23A6F0] shadow-sm hover:shadow-lg rounded-full p-2 transition-all duration-300 hover:scale-110 border border-gray-200`}
                style={{ transform: "translate(-50%, -50%)" }}
                aria-label="السابق"
              >
                <HiArrowNarrowLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            )}

            {/* Right Navigation Button - مع مسافة أكبر */}
            {currentIndex <= maxIndex && (
              <button
                onClick={() => scrollByAmount("right")}
                dir="rtl"
                className={`${
                  language === "en"
                    ? "start-2 md:start-[-30px]"
                    : "start-2 md:start-[-30px]"
                } absolute top-1/2 md:top-1/2 -translate-y-1/2 z-20 bg-[#23A6F0] hover:bg-[#23A6F0] shadow-sm hover:shadow-lg rounded-full p-2 transition-all duration-300 hover:scale-110 border border-gray-200`}
                style={{ transform: "translate(50%, -50%)" }}
                aria-label="التالي"
              >
                <HiOutlineArrowNarrowRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            )}
            {/* Slider Track */}
            <div ref={containerRef} className="overflow-hidden">
              <div
                ref={sliderRef}
                className="flex gap-3 md:gap-5 cursor-grab active:cursor-grabbing select-none"
                style={{
                  transform: `translateX(${currentTranslate}px)`,
                  transition:
                    isAnimating && !isDragging
                      ? "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                      : "none",
                  willChange: "transform",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0"
                    style={{
                      width:
                        itemsPerView >= 4
                          ? "calc((100% / 4.5) - 10px)"
                          : itemsPerView >= 3
                            ? "calc((100% / 3) - 10px)"
                            : "calc((100% / 2) - 8px)",
                      minWidth:
                        itemsPerView >= 4
                          ? "calc((100% / 4.5) - 10px)"
                          : itemsPerView >= 3
                            ? "calc((100% / 3) - 10px)"
                            : "calc((100% / 2) - 8px)",
                    }}
                  >
                    <div
                      className="animate-in fade-in zoom-in duration-500 flex justify-center w-full"
                      style={{
                        animationFillMode: "both",
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.image}
                        hoverImage={product.hoverImage}
                        href={product.href}
                        originalPrice={product.originalPrice}
                        discount={product.discount}
                        colors={product.colors}
                        rating={product.rating}
                        reviewsCount={product.reviewsCount}
                        isBestSeller={product.isBestSeller}
                        hasVariants={product.hasVariants || false}
                        variants={product.variants || []}
                        variantId={product.variantId || null}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-in {
            animation: fadeIn 0.5s ease-out forwards;
          }

          .cursor-grabbing {
            cursor: grabbing;
          }

          .select-none {
            user-select: none;
            -webkit-user-select: none;
          }
        `}</style>
      </section>
    )
  );
}
