// components/products/CategorySlider.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

interface SliderImage {
  id: number;
  title: string;
  sub_title: string;
  description: string;
  image: string;
}

interface CategorySliderProps {
  sliders: SliderImage[];
  categoryName?: string;
  categoryId?: number;
  className?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
}

// ✅ دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === "en") {
    return {
      shopNow: "Shop Now",
      previous: "Previous slide",
      next: "Next slide",
      goToSlide: "Go to slide",
      viewProducts: "View Products",
      loading: "Loading...",
      noSliders: "No sliders available",
    };
  }
  // Arabic (default)
  return {
    shopNow: "تسوق الآن",
    previous: "شريحة سابقة",
    next: "شريحة تالية",
    goToSlide: "الانتقال إلى الشريحة",
    viewProducts: "عرض المنتجات",
    loading: "جاري التحميل...",
    noSliders: "لا توجد سلايدرات متاحة",
  };
};

const API_BASE_URL = "https://admin.souqkaber.com";

export function CategorySlider({
  sliders,
  categoryName,
  categoryId,
  className = "",
  autoplay = true,
  autoplayDelay = 5000,
}: CategorySliderProps) {
  const { language } = useLanguage();
  const t = getTranslations(language);

  // ✅ تعريف جميع الـ Hooks أولاً (قبل أي return)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ التنقل بين السلايدرات
  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex((prev) => {
        if (index < 0) return sliders.length - 1;
        if (index >= sliders.length) return 0;
        return index;
      });
    },
    [sliders.length],
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // ✅ التشغيل التلقائي
  useEffect(() => {
    if (!autoplay || isHovered || sliders.length <= 1) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      return;
    }

    autoplayRef.current = setInterval(nextSlide, autoplayDelay);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [autoplay, isHovered, nextSlide, autoplayDelay, sliders.length]);

  // ✅ أحداث السحب بالماوس
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const diff = startX - e.clientX;

      if (diff > 50) {
        nextSlide();
        setIsDragging(false);
      } else if (diff < -50) {
        prevSlide();
        setIsDragging(false);
      }
    },
    [isDragging, startX, nextSlide, prevSlide],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ✅ أحداث اللمس
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartX(touch.clientX);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];

      const diff = startX - touch.clientX;

      if (diff > 50) {
        nextSlide();
        setIsDragging(false);
      } else if (diff < -50) {
        prevSlide();
        setIsDragging(false);
      }
    },
    [isDragging, startX, nextSlide, prevSlide],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ✅ التحقق من وجود سلايدرات (بعد تعريف جميع الـ Hooks)
  if (!sliders || sliders.length === 0) {
    return null;
  }

  const currentSlider = sliders[currentIndex];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseLeave();
      }}
    >
      {/* الحاوية الرئيسية للسلايدر - نفس تصميم AdsHome */}
      <div
        // className="bg-[#F2F8FD] rounded-2xl grid grid-cols-1 items-center justify-between px-2 md:px-10 py-6 md:py-8 relative overflow-hidden select-none"
        className="bg-[#F2F8FD] w-[100%] h-[200px] lg:h-[500px] relative overflow-hidden select-none"
        
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* محتوى السلايدر - نفس ترتيب AdsHome */}
        {/* <div className="flex flex-col gap-2 md:gap-5 flex-1 z-10 px-4 md:px-0">
          {currentSlider?.sub_title ? (
            <p className="text-[10px] md:text-[12px] font-semibold py-1 px-2 bg-[#FF995D] text-white w-fit rounded">
              {currentSlider.sub_title}
            </p>
          ) : (
            <p className="text-[8px] md:text-[16px] font-semibold py-0.5 px-1.5 md:px-3 text-[#BE4646] text-center md:text-right">
              {categoryName || ""}
            </p>
          )}

          <h1 className="text-sm md:text-xl font-bold text-[#191C1F]">
            {currentSlider?.title}
          </h1>

          {currentSlider?.description && (
            <p className="text-sm md:text-base text-[#191C1F] w-full md:w-[80%] leading-[1.5]">
              {currentSlider.description}
            </p>
          )}

          <Link
            href={
              categoryId ? `/products?categories=[${categoryId}]` : "/products"
            }
            className="w-fit md:w-[180px] md:h-[60px] animate-in text-[12px] line-clamp-1 md:text-[14px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl flex items-center justify-center gap-2 text-white px-6 py-2 md:px-8 md:py-3"
            style={{ backgroundColor: "#23A6F0" }}
          >
            {t.shopNow}
            <FaArrowLeft
              className={`h-4 w-4 ${language === "en" ? "rotate-180" : ""}`}
            />
          </Link>
        </div> */}

        {/* صورة السلايدر - نفس أبعاد AdsHome */}
        <div className=" relative w-full h-full">
          <Image
            src={
              currentSlider?.image
                ? `${API_BASE_URL}${currentSlider.image.trim()}`
                : "/images/placeholder-product.jpg"
            }
            alt={currentSlider?.title || "Slider image"}
            // className="w-[250px] md:w-[416px] h-[150px] md:h-[304px] lg:w-[536px] lg:h-[424px] object-contain rounded-lg"
            className=" object-cover"
            fill
            // width={536}
            // height={424}
            priority
          />
        </div>
      </div>

      {/* مؤشرات التقدم (dots) - نفس تصميم AdsHome */}
      {sliders.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index
                  ? "w-6 h-2 bg-black"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`${t.goToSlide} ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
