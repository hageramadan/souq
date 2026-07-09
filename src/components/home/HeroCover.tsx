"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSliders } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const API_BASE_URL = 'https://admin.souqkaber.com';

// ✅ دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      loadingSlides: "Loading slides...",
      shopNow: "Shop Now",
    };
  }
  // Arabic (default)
  return {
    loadingSlides: "جاري تحميل العروض...",
    shopNow: "تسوق الآن",
  };
};

export function Hero() {
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSwipingHorizontal, setIsSwipingHorizontal] = useState(false);

  // ✅ جلب السلايدرز من العميل
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const slidersData = await getSliders();
        
        const transformedSlides: Slide[] = slidersData.length > 0 
          ? slidersData.map(slider => ({
              id: slider.id,
              image: `${API_BASE_URL}${slider.image}`,
              title: slider.name,
              description: slider.description,
              buttonText: t.shopNow,
              buttonLink: slider.link || "/products",
            }))
          : [];
        
        setSlides(transformedSlides);
      } catch (error) {
        console.error('Error fetching sliders:', error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSliders();
  }, [t.shopNow]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToNextSlide = () => {
    if (slides.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevSlide = () => {
    if (slides.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
    setIsAutoPlaying(false);
    setIsSwipingHorizontal(false);
    setDragProgress(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;
    
    if (!isSwipingHorizontal && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        setIsSwipingHorizontal(true);
      } else {
        setIsDragging(false);
        return;
      }
    }
    
    if (isSwipingHorizontal) {
      const containerWidth = containerRef.current.clientWidth;
      let progress = diffX / containerWidth;
      progress = Math.min(Math.max(progress, -0.8), 0.8);
      setDragProgress(progress);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const minSwipeDistance = 0.15;
    
    if (Math.abs(dragProgress) > minSwipeDistance && isSwipingHorizontal) {
      if (dragProgress < 0) {
        goToNextSlide();
      } else if (dragProgress > 0) {
        goToPrevSlide();
      }
    }
    
    setIsDragging(false);
    setDragProgress(0);
    touchStartX.current = 0;
    touchStartY.current = 0;
    setIsSwipingHorizontal(false);
    
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const getPrevIndex = () => {
    return currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
  };

  const getNextIndex = () => {
    return (currentSlide + 1) % slides.length;
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <section className="relative w-full h-[55vh] lg:h-[70vh] overflow-hidden bg-gray-200">
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-300 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#23A6F0] border-t-transparent rounded-full animate-spin"></div>
            </div>
          
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div>
     { slides.length > 0 && (
       <section className="relative w-full h-[55vh] lg:h-[70vh] overflow-hidden bg-gray-900">
      <div 
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden ${
          isDragging && isSwipingHorizontal ? 'touch-none' : 'touch-pan-y'
        }`}
        style={{
          cursor: isDragging && isSwipingHorizontal ? 'grabbing' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full">
          <div 
            className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
            style={{
              transform: `translateX(${dragProgress * 100}%)`,
              zIndex: 10,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                fill
                className="object-cover pointer-events-none"
                priority={currentSlide === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </div>

            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="container-custom text-center text-white gap-3 pointer-events-auto">
                <h1 className="text-xl lg:text-[24px] font-bold mb-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                  {slides[currentSlide].title}
                </h1>
                
                {slides[currentSlide].description && (
                  <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                    {slides[currentSlide].description}
                  </p>
                )}
                
                <Button
                  asChild
                  className="animate-in text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl"
                  style={{ 
                    backgroundColor: '#23A6F0',
                    width: '177px',
                    height: '56px'
                  }}
                >
                  <Link 
                    href={slides[currentSlide].buttonLink} 
                    className="flex items-center justify-center gap-2"
                  >
                    {t.shopNow}
                    <FaArrowLeft className={`h-4 w-4 ${language === 'en' ? 'rotate-180' : ''}`} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {slides.length > 1 && (
            <div 
              className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
              style={{
                transform: `translateX(${dragProgress < 0 ? (100 + dragProgress * 100) : 100}%)`,
                zIndex: dragProgress < 0 ? 15 : 5,
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={slides[getNextIndex()].image}
                  alt={slides[getNextIndex()].title}
                  fill
                  className="object-cover pointer-events-none"
                  priority={false}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              </div>
            </div>
          )}

          {slides.length > 1 && (
            <div 
              className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
              style={{
                transform: `translateX(${dragProgress > 0 ? (-100 + dragProgress * 100) : -100}%)`,
                zIndex: dragProgress > 0 ? 15 : 5,
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={slides[getPrevIndex()].image}
                  alt={slides[getPrevIndex()].title}
                  fill
                  className="object-cover pointer-events-none"
                  priority={false}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevSlide}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          <button
            onClick={goToNextSlide}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-8 h-2 bg-[#23A6F0]"
                  : "w-2 h-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
     ) }
    </div>
   
  );
}