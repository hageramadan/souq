// components/products/BrandSlider.tsx
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface BrandOption {
  id: number;
  name: string;
  logo?: string; // اختياري: يمكن إضافة رابط شعار البراند
}

interface BrandSliderProps {
  brands: BrandOption[];
  selectedBrands?: number[];
  onBrandToggle?: (brandId: number) => void;
  className?: string;
}

export function BrandSlider({ 
  brands, 
  selectedBrands = [], 
  onBrandToggle,
  className = '' 
}: BrandSliderProps) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // ✅ التحقق من وجود براندات مختارة - الكل افتراضياً
  const isAllSelected = selectedBrands.length === 0;

  // ✅ التحقق من اختيار براند معين
  const isBrandSelected = useCallback((brandId: number) => {
    return selectedBrands.includes(brandId);
  }, [selectedBrands]);

  // ✅ معالج اختيار البراند
  const handleBrandClick = useCallback((brandId: number) => {
    if (onBrandToggle) {
      onBrandToggle(brandId);
    }
  }, [onBrandToggle]);

  // ✅ معالج اختيار الكل
  const handleAllClick = useCallback(() => {
    if (onBrandToggle) {
      // إلغاء اختيار كل البراندات (يعني اختيار الكل)
      // سنقوم بتمرير -1 كإشارة لاختيار الكل
      onBrandToggle(-1);
    }
  }, [onBrandToggle]);

  // ✅ التحقق من إمكانية التمرير
  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft: currentScroll, scrollWidth, clientWidth } = container;
    setShowLeftArrow(currentScroll > 0);
    setShowRightArrow(currentScroll < scrollWidth - clientWidth - 1);
  }, []);

  // ✅ التمرير إلى اليسار
  const scrollLeftHandler = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  // ✅ التمرير إلى اليمين
  const scrollRightHandler = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  // ✅ أحداث السحب بالماوس
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(false);
    container.style.cursor = 'grab';
    container.style.userSelect = 'auto';
    checkScrollButtons();
  }, [checkScrollButtons]);

  // ✅ أحداث اللمس للهواتف
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const touch = e.touches[0];
    setStartX(touch.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const touch = e.touches[0];
    const x = touch.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  }, [startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    checkScrollButtons();
  }, [checkScrollButtons]);

  // ✅ تحديث حالة الأزرار عند التمرير
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => checkScrollButtons();
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollButtons);

    // التحقق الأولي
    checkScrollButtons();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [checkScrollButtons]);

  // ✅ تحديث عند تغيير البراندات
  useEffect(() => {
    checkScrollButtons();
  }, [brands, checkScrollButtons]);

  // ✅ الحصول على اتجاه اللغة من الترجمة
  const isRTL = t('common.dir') === 'rtl';

  return (
    <div className={`relative w-full ${className}`}>
      {/* حاوية البراندات مع السحب */}
      <div className="relative group">
        {/* سهم اليسار */}
        {showLeftArrow && (
          <button
            onClick={scrollLeftHandler}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 hover:scale-110 hidden md:flex items-center justify-center"
            style={{ 
              transform: isRTL ? 'translateY(-50%) scaleX(-1)' : 'translateY(-50%)',
              left: isRTL ? 'auto' : '-12px',
              right: isRTL ? '-12px' : 'auto'
            }}
            aria-label={t('brandSlider.scrollLeft')}
          >
            <ChevronLeft className="w-5 h-5 text-[#112B40]" />
          </button>
        )}

        {/* حاوية التمرير */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto p-4 scrollbar-hide"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* زر الكل */}
          <div
            className="flex-shrink-0 scroll-snap-start"
            style={{ scrollSnapAlign: 'start' }}
          >
            <button
              onClick={handleAllClick}
              className={`
                flex flex-col items-center justify-center gap-2 min-w-[80px] sm:min-w-[100px] md:min-w-[120px] 
                px-3 py-2  rounded-full border transition-all duration-300
                hover:shadow-lg hover:scale-105
                ${isAllSelected 
                  ? 'border-[#1E75AB] bg-[#1E75AB] text-white shadow-md' 
                  : 'border-[#1E75AB] bg-white hover:border-[#1E75AB] text-[#1E75AB]'
                }
              `}
            >
              <span className={`text-base font-semibold ${isAllSelected ? 'text-white' : 'text-[#1E75AB]'}`}>
                {t('brandSlider.all')}
              </span>
            </button>
          </div>

          {/* قائمة البراندات */}
          {brands.map((brand) => {
            const isSelected = isBrandSelected(brand.id);
            
            return (
              <div
                key={brand.id}
                className="flex-shrink-0 scroll-snap-start"
                style={{ scrollSnapAlign: 'start' }}
              >
                <button
                  onClick={() => handleBrandClick(brand.id)}
                  className={`
                    flex flex-col items-center justify-center gap-2 min-w-[100px] sm:min-w-[120px] md:min-w-[140px]
                    px-3 py-2  rounded-full border transition-all duration-300
                    hover:shadow-lg hover:scale-105
                    ${isSelected 
                      ? 'border-[#1E75AB] bg-[#1E75AB] text-white shadow-md' 
                      : 'border-[#1E75AB] bg-white hover:border-[#1E75AB] text-[#1E75AB]'
                    }
                  `}
                >
                  {/* اسم البراند */}
                  <span className={`text-base font-semibold text-center line-clamp-1 ${isSelected ? 'text-white' : 'text-[#1E75AB]'}`}>
                    {brand.name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* سهم اليمين */}
        {showRightArrow && (
          <button
            onClick={scrollRightHandler}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 hover:scale-110 hidden md:flex items-center justify-center"
            style={{ 
              transform: isRTL ? 'translateY(-50%) scaleX(-1)' : 'translateY(-50%)',
              right: isRTL ? 'auto' : '-12px',
              left: isRTL ? '-12px' : 'auto'
            }}
            aria-label={t('brandSlider.scrollRight')}
          >
            <ChevronRight className="w-5 h-5 text-[#112B40]" />
          </button>
        )}
      </div>

      {/* CSS لإخفاء شريط التمرير */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scroll-snap-start {
          scroll-snap-align: start;
        }
        @media (max-width: 640px) {
          .scroll-snap-start {
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  );
}