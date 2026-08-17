// components/products/SubCategoriesSlider.tsx

"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SubCategoryCard from "./SubCategoryCard";

interface SubCategory {
  id: number;
  name: string;
  image?: string;
  slug?: string;
  products_count?: number;
}

interface SubCategoriesSliderProps {
  subCategories: SubCategory[];
  categoryId?: number | undefined;
  lang?: string;
  title?: string;
  showTitle?: boolean;
  className?: string;
}

export default function SubCategoriesSlider({
  subCategories,
  lang = "ar",
   categoryId,
  title = "الفئات الفرعية",
  showTitle = true,
  className = "",
}: SubCategoriesSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // التحقق من وجود عناصر
  if (!subCategories || subCategories.length === 0) {
    return null;
  }

  // التحقق من إمكانية التمرير
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft: currentScrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(currentScrollLeft > 10);
    setShowRightArrow(currentScrollLeft < scrollWidth - clientWidth - 10);
  };

  // التمرير لليمين أو اليسار
  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  // أحداث السحب بالماوس
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // تحديث أزرار التمرير عند تغيير الحجم أو التمرير
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollButtons();
    container.addEventListener("scroll", checkScrollButtons);
    window.addEventListener("resize", checkScrollButtons);

    return () => {
      container.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [subCategories]);

  return (
    <div className={`relative group ${className} `}>
     

      {/* حاوية السلايدر */}
      <div className="relative">
        {/* زر التمرير لليسار */}
        {/* {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 -ml-3 border border-gray-200 hover:border-[#2D93CA] opacity-0 group-hover:opacity-100"
            aria-label="تمرير لليسار"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )} */}

        {/* المحتوى القابل للتمرير */}
        <div
          ref={scrollContainerRef}
          className={`flex gap-4 sm:gap-6 py-7 lg:py-10 ps-3 overflow-x-auto scroll-smooth  ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {subCategories.map((subCategory) => (
            <div
              key={subCategory.id}
              className="flex-shrink-0"
            >
              <SubCategoryCard
              categoryId={categoryId || undefined}
                subCategory={subCategory}
                lang={lang}
              />
            </div>
          ))}
        </div>

        {/* زر التمرير لليمين */}
        {/* {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 -mr-3 border border-gray-200 hover:border-[#2D93CA] opacity-0 group-hover:opacity-100"
            aria-label="تمرير لليمين"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )} */}
      </div>

      {/* مؤشر التمرير (للموبايل) */}
      {/* {subCategories.length > 3 && (
        <div className="flex justify-center gap-1 mt-4 md:hidden">
          {subCategories.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === 0 ? "bg-[#2D93CA] w-4" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )} */}
    </div>
  );
}