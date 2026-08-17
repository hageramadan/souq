// components/products/SubCategoryCard.tsx

"use client";

import Image from "next/image";
import { cleanImageUrl } from "@/types/product";
import { useRouter } from "next/navigation";

interface SubCategory {
  id: number;
  name: string;
  image?: string; // ✅ جعلها اختيارية
  slug?: string;
  products_count?: number;
}

interface SubCategoryCardProps {
  subCategory: SubCategory;
  categoryId?: number | undefined;
  lang?: string;
  className?: string;
}
export default function SubCategoryCard({ 
  subCategory, 
  categoryId,
  lang = "ar",
  className = "" 
}: SubCategoryCardProps) {
  const router = useRouter();
  const imageUrl = subCategory.image ? cleanImageUrl(subCategory.image) : null;

 const handleClick = () => {
  router.push(
    `/products?categories=${JSON.stringify([categoryId])}&subcategories=${JSON.stringify([subCategory.id])}`
  );
};

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.05] ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* صورة الفئة */}
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 transition-all duration-300 hover:border-[#2D93CA] hover:shadow-md">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={subCategory.name}
            width={112}
            height={112}
            className="object-contain w-[62px] h-[62px] lg:w-[90px] lg:h-[90px] transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* اسم الفئة */}
      <span className="text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-300 hover:text-[#2D93CA] text-center line-clamp-2 max-w-[100px] sm:max-w-[120px] md:max-w-[140px]">
        {subCategory.name}
      </span>
    </div>
  );
}