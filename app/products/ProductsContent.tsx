// app/products/ProductsContent.tsx
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/FilterSidebar";
import { BrandSlider } from "@/components/products/BrandSlider";
import { CategorySlider } from "@/components/products/CategorySlider";
import Pagination from "@/components/products/Pagination";
import { getAllProducts, getCategories, getBrands } from "@/services/api";
import { ProductData } from "@/services/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { X } from "lucide-react";
import Link from "next/link";
import { VscSettings } from "react-icons/vsc";
import { useTranslation } from "@/hooks/useTranslation";
import { BsArrowDownUp } from "react-icons/bs";

// ============================================================================
// Types
// ============================================================================

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

interface FiltersState {
  categoryIds?: number[];
  colors?: string[];
  attribute_values?: number[];
  brands?: number[];
  minPrice?: number;
  maxPrice?: number;
}

interface SliderImage {
  id: number;
  title: string;
  sub_title: string;
  description: string;
  image: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

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

// ============================================================================
// Main Component
// ============================================================================

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState<FiltersState>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [categorySliders, setCategorySliders] = useState<SliderImage[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(
    null,
  );

  // ✅ حالة البراندات
  const [allBrands, setAllBrands] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [categoryBrands, setCategoryBrands] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [isCategorySpecificBrands, setIsCategorySpecificBrands] = useState(false);

  // حالة الترتيب
  const [sortBy, setSortBy] = useState<string>("all");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // ✅ إضافة ref للمنيو الترتيب
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const perPage = 12;

  const hasLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFilterChangeRef = useRef(false);
  const [loadingSliders, setLoadingSliders] = useState(false);

  // ✅ إغلاق المنيو عند النقر في أي مكان خارج العنصر
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    // إضافة مستمع الحدث عند فتح المنيو فقط
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // تنظيف المستمع
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  // ✅ تحميل البراندات العامة
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsData = await getBrands();
        setAllBrands(brandsData);
      } catch (error) {
        console.error("Error loading brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // ✅ تحميل بيانات الفئة - التعديل الرئيسي
  useEffect(() => {
    const categoriesParam = searchParams.get("categories");
    
    const loadCategoryData = async () => {
      try {
         setLoadingSliders(true);
        // إذا لم توجد فئة محددة
        if (!categoriesParam) {
          setCategoryBrands(allBrands);
          setIsCategorySpecificBrands(false);
          setCategoryName(null);
          setCategorySliders([]);
          setCurrentCategoryId(null);
          return;
        }

        const categoryIds = JSON.parse(categoriesParam);
        if (!categoryIds || categoryIds.length === 0) {
          setCategoryBrands(allBrands);
          setIsCategorySpecificBrands(false);
          setCategoryName(null);
          setCategorySliders([]);
          setCurrentCategoryId(null);
          return;
        }

        const categoryId = categoryIds[0];
        setCurrentCategoryId(categoryId);
        setFilters((prev) => ({ ...prev, categoryIds: [categoryId] }));

        // جلب جميع الفئات من الـ API
        const categories = await getCategories();
        const category = categories.find((c) => c.id === categoryId);

        if (category) {
          setCategoryName(category.name);

          // جلب السلايدرات
          if (category.sliders && category.sliders.length > 0) {
            setCategorySliders(category.sliders);
          } else {
            setCategorySliders([]);
          }

          // ✅ جلب براندات الفئة
          if (category.brands && category.brands.length > 0) {
            console.log("✅ Category brands found:", category.brands);
            setCategoryBrands(category.brands);
            setIsCategorySpecificBrands(true);
          } else {
            console.log("⚠️ No category brands, using all brands");
            setCategoryBrands(allBrands.length > 0 ? allBrands : []);
            setIsCategorySpecificBrands(false);
          }
        } else {
          // إذا لم يتم العثور على الفئة
          setCategoryBrands(allBrands.length > 0 ? allBrands : []);
          setIsCategorySpecificBrands(false);
          setCategoryName(null);
          setCategorySliders([]);
        }
      } catch (error) {
        console.error("Error loading category data:", error);
        setCategoryBrands(allBrands.length > 0 ? allBrands : []);
        setIsCategorySpecificBrands(false);
      }
    };

    loadCategoryData();
  }, [searchParams, allBrands]);

  const loadProducts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const filterParams: any = {
        page: currentPage,
        per_page: perPage,
      };

      // إضافة معامل الترتيب
      if (sortBy !== "all") {
        filterParams.sort = sortBy;
      }

      if (filters.categoryIds && filters.categoryIds.length > 0) {
        filterParams.categories = filters.categoryIds;
      }
      if (filters.colors && filters.colors.length > 0) {
        filterParams.colors = filters.colors;
      }
      if (filters.attribute_values && filters.attribute_values.length > 0) {
        filterParams.attribute_values = filters.attribute_values;
      }
      if (selectedBrands && selectedBrands.length > 0) {
        filterParams.brands = selectedBrands;
      }
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        filterParams.price_range = [
          filters.minPrice,
          filters.maxPrice || 1000000,
        ];
      }

      const { products: productsData, pagination } =
        await getAllProducts(filterParams);

      if (!abortControllerRef.current?.signal.aborted) {
        setProducts(productsData);
        if (pagination) {
          setLastPage(pagination.last_page || 1);
          setTotalProducts(pagination.total || 0);
        }
        hasLoadedRef.current = true;
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error("Error loading products:", error);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [currentPage, filters, selectedBrands, perPage, sortBy]);

  // ✅ معالج اختيار البراند
  const handleBrandToggle = useCallback((brandId: number) => {
    setSelectedBrands((prev) => {
      if (brandId === -1) {
        return [];
      }

      if (prev.includes(brandId)) {
        return prev.filter((id) => id !== brandId);
      } else {
        return [...prev, brandId];
      }
    });
    setCurrentPage(1);
  }, []);

  // ترتيب المنتجات على الواجهة الأمامية
  const sortedProducts = useMemo(() => {
    if (!products.length) return products;

    const sorted = [...products];

    switch (sortBy) {
      case "price_asc":
        sorted.sort((a, b) => a.pricing.final_price - b.pricing.final_price);
        break;
      case "price_desc":
        sorted.sort((a, b) => b.pricing.final_price - a.pricing.final_price);
        break;
      case "best_seller":
        sorted.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
        break;
      case "offers":
        sorted.sort((a, b) => {
          const aHasDiscount = a.pricing.has_discount ? 1 : 0;
          const bHasDiscount = b.pricing.has_discount ? 1 : 0;
          return bHasDiscount - aHasDiscount;
        });
        break;
      default:
        break;
    }

    return sorted;
  }, [products, sortBy]);

  useEffect(() => {
    if (hasLoadedRef.current || isFilterChangeRef.current) {
      loadProducts();
    } else {
      hasLoadedRef.current = true;
      loadProducts();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadProducts]);

  const handleFilterChange = (newFilters: any) => {
    const updatedFilters: FiltersState = {};

    if (newFilters.categoryIds) {
      updatedFilters.categoryIds = newFilters.categoryIds;
    }
    if (newFilters.colors) {
      updatedFilters.colors = newFilters.colors;
    }
    if (newFilters.attribute_values) {
      updatedFilters.attribute_values = newFilters.attribute_values;
    }
    if (newFilters.brands) {
      setSelectedBrands(newFilters.brands);
    }
    if (newFilters.minPrice !== undefined) {
      updatedFilters.minPrice = newFilters.minPrice;
    }
    if (newFilters.maxPrice !== undefined) {
      updatedFilters.maxPrice = newFilters.maxPrice;
    }

    isFilterChangeRef.current = true;
    setFilters(updatedFilters);
    setCurrentPage(1);
    setIsMobileFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
    setIsSortOpen(false);
  };

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileFilterOpen]);

  const transformProductForCard = (product: ProductData) => {
    let colors: Array<{ color: string; name: string }> = [];

    if (
      product.has_variants &&
      product.variants &&
      product.variants.length > 0
    ) {
      colors = extractColorsFromVariants(product.variants as ProductVariant[]);
    }

    const cleanImageUrl = (url: string) => {
      if (!url) return "/images/placeholder-product.jpg";
      if (url.startsWith("/storage")) {
        return `https://admin.souqkaber.com${url}`;
      }
      return `https://admin.souqkaber.com/storage${url}`;
    };

    return {
      id: product.id.toString(),
      name: product.name,
      price: product.pricing.final_price,
      image: cleanImageUrl(product.images?.[0]),
      hoverImage: product.images?.[1]
        ? cleanImageUrl(product.images[1])
        : cleanImageUrl(product.images?.[0]),
      href: `/product/${product.id}`,
      originalPrice: product.pricing.has_discount
        ? product.pricing.price
        : undefined,
      discount: product.pricing.has_discount
        ? Math.round(
            ((product.pricing.price -
              (product.pricing.price_after_discount || 0)) /
              product.pricing.price) *
              100,
          )
        : undefined,
      colors: colors,
      rating: product.avg_rating || 0,
      reviewsCount: product.total_reviews || 0,
      isBestSeller: product.is_active,
      hasVariants: product.has_variants || false,
      variants: product.variants || [],
    };
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categoryIds && filters.categoryIds.length > 0)
      count += filters.categoryIds.length;
    if (filters.colors && filters.colors.length > 0)
      count += filters.colors.length;
    if (filters.attribute_values && filters.attribute_values.length > 0)
      count += filters.attribute_values.length;
    if (selectedBrands && selectedBrands.length > 0)
      count += selectedBrands.length;
    if (filters.minPrice !== undefined && filters.minPrice > 0) count++;
    if (filters.maxPrice !== undefined && filters.maxPrice < 1000) count++;
    return count;
  };

  // ✅ تحديد البراندات التي سيتم عرضها - مع التأكد من مسح البراندات القديمة
  const displayBrands = useMemo(() => {
    // إذا كانت الفئة محددة ولديها براندات خاصة
    if (currentCategoryId !== null && isCategorySpecificBrands) {
      return categoryBrands;
    }
    
    // إذا كانت الفئة محددة ولكن ليس لديها براندات
    if (currentCategoryId !== null && !isCategorySpecificBrands) {
      return []; // ✅ عرض فارغ بدلاً من البراندات العامة
    }
    
    // إذا لم توجد فئة محددة، استخدم البراندات العامة
    return allBrands;
  }, [currentCategoryId, isCategorySpecificBrands, categoryBrands, allBrands]);

  return (
    <div className="min-h-screen">
      {/* Add CSS for responsive sorting sections */}
      <style jsx>{`
        .sort-section1 {
        position:relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .sort-section2 {
          display: none;
        }
        
        @media (max-width: 768px) {
          .sort-section1 {
            display: none;
          }
          .sort-section2 {
            display: block;
          }
        }
      `}</style>

      <div className="flex items-end gap-1 container page-with-padding ">
        <Link href="/" className="text-[#726C6C] text-lg lg:text-xl mb-2 lg:mb-5">
          {t("products.home")}
        </Link>
        <span className="mb-2 lg:mb-5">/</span>
        <h1 className="text-base md:text-xl font-bold text-[#180100] mb-2 lg:mb-5">
          {categoryName
            ? ` ${categoryName}`
            : t("products.allProducts")}
        </h1>
      </div>

      <div className="container mx-auto px-4 pb-16 ">
        {/* ✅ Category Slider */}
     
        {categorySliders.length > 0 && (
          <div className="mb-2" key={currentCategoryId}> {/* ✅ إضافة key */}
            <CategorySlider
              sliders={categorySliders}
              categoryName={categoryName || undefined}
              categoryId={currentCategoryId || undefined}
              autoplay={true}
              autoplayDelay={5000}
            />
          </div>
        )}

        {/* ✅ BrandSlider - يعرض براندات الفئة المختارة */}
        {categoryBrands.length > 0 && (
          <div className="mb-2 bg-white ps-1 py-4 lg:ps-4 lg:p-4 ">
            <BrandSlider
              brands={displayBrands}
              selectedBrands={selectedBrands}
              onBrandToggle={handleBrandToggle}
              showCategoryBrandsLabel={isCategorySpecificBrands}
              categoryName={categoryName || undefined}
            />
          </div>
        )}
        
        {/* فلتر الترتيب - نسخة سطح المكتب (sort-section1) */}
        <div className="sort-section1" ref={sortMenuRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="px-4 py-2 relative bg-white border border-gray-300 rounded-[8px] flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <BsArrowDownUp className=" " />
            <span className="text-gray-600 text-sm whitespace-nowrap">
              {t("products.sortBy")}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isSortOpen && (
            <div
              className={`absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-30 ${
                t("common.dir") === "rtl" ? "left-3" : "right-3"
              }`}
            >
              <button
                onClick={() => handleSortChange("all")}
                className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                  sortBy === "all"
                    ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                    : "text-gray-700"
                }`}
              >
                {t("products.sortAll")}
              </button>
              <button
                onClick={() => handleSortChange("price_asc")}
                className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                  sortBy === "price_asc"
                    ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                    : "text-gray-700"
                }`}
              >
                {t("products.sortPriceAsc")}
              </button>
              <button
                onClick={() => handleSortChange("price_desc")}
                className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                  sortBy === "price_desc"
                    ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                    : "text-gray-700"
                }`}
              >
                {t("products.sortPriceDesc")}
              </button>
              <button
                onClick={() => handleSortChange("best_seller")}
                className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                  sortBy === "best_seller"
                    ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                    : "text-gray-700"
                }`}
              >
                {t("products.sortBestSeller")}
              </button>
              <button
                onClick={() => handleSortChange("offers")}
                className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                  sortBy === "offers"
                    ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                    : "text-gray-700"
                }`}
              >
                {t("products.sortOffers")}
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="rounded-[8px] mb-3 flex justify-between items-center">
              <div className="flex justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileFilterOpen(true);
                    }}
                    className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#2D93CA] rounded-[8px] hover:bg-gray-200 transition-colors"
                  >
                    <VscSettings className="w-6 h-6 text-white" />
                  </button>
                  
                </div>
              </div>
              
              {/* فلتر الترتيب - نسخة الموبايل (sort-section2) */}
              <div className="sort-section2" ref={sortMenuRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-[8px] flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <BsArrowDownUp className=" " />
                  <span className="text-gray-600 text-sm whitespace-nowrap">
                    {t("products.sortBy")}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isSortOpen && (
                  <div
                    className={`absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-30 ${
                      t("common.dir") === "rtl" ? "left-3" : "right-3"
                    }`}
                  >
                    <button
                      onClick={() => handleSortChange("all")}
                      className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                        sortBy === "all"
                          ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                          : "text-gray-700 "
                      }`}
                    >
                      {t("products.sortAll")}
                    </button>
                    <button
                      onClick={() => handleSortChange("price_asc")}
                      className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                        sortBy === "price_asc"
                          ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                          : "text-gray-700"
                      }`}
                    >
                      {t("products.sortPriceAsc")}
                    </button>
                    <button
                      onClick={() => handleSortChange("price_desc")}
                      className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                        sortBy === "price_desc"
                          ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                          : "text-gray-700"
                      }`}
                    >
                      {t("products.sortPriceDesc")}
                    </button>
                    <button
                      onClick={() => handleSortChange("best_seller")}
                      className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                        sortBy === "best_seller"
                          ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                          : "text-gray-700"
                      }`}
                    >
                      {t("products.sortBestSeller")}
                    </button>
                    <button
                      onClick={() => handleSortChange("offers")}
                      className={`block w-full  px-4 py-2 hover:bg-gray-100 transition-colors ${
                        sortBy === "offers"
                          ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                          : "text-gray-700"
                      }`}
                    >
                      {t("products.sortOffers")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <LoadingSpinner
                size="lg"
                text={t("products.loading")}
              />
            ) : sortedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => {
                    const cardData = transformProductForCard(product);
                    return (
                      <div
                        key={cardData.id}
                        className="flex justify-center w-full"
                      >
                        <ProductCard
                          id={cardData.id}
                          name={cardData.name}
                          price={cardData.price}
                          image={cardData.image}
                          hoverImage={cardData.hoverImage}
                          href={cardData.href}
                          originalPrice={cardData.originalPrice}
                          discount={cardData.discount}
                          colors={cardData.colors}
                          rating={cardData.rating}
                          reviewsCount={cardData.reviewsCount}
                          isBestSeller={cardData.isBestSeller}
                          hasVariants={cardData.hasVariants}
                          variants={cardData.variants}
                          variantId={
                            cardData.hasVariants && cardData.variants.length > 0
                              ? cardData.variants[0].id
                              : null
                          }
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12">
                  <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    onPageChange={handlePageChange}
                    total={totalProducts}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">
                  {t("products.noProducts")}
                </p>
                <p className="text-gray-500 mt-2">
                  {t("products.tryChangingFilters")}
                </p>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <ProductFilters
              onFilterChange={handleFilterChange}
              lang={t("common.lang")}
              categoryId={currentCategoryId}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <div
        className={`
          fixed inset-0 z-30 md:hidden
          ${isMobileFilterOpen ? "block" : "hidden"}
        `}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setIsMobileFilterOpen(false)}
        />

        <div
          className={`
            absolute bottom-0 left-3 right-3 
            bg-white rounded-t-3xl shadow-2xl
            transition-transform duration-300 ease-out
            ${isMobileFilterOpen ? "translate-y-0" : "translate-y-full"}
          `}
          style={{
            maxHeight: "85vh",
            height: "auto",
          }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          <div className="sticky top-0  bg-white border-b border-gray-200 p-4 flex justify-between items-center z-50 rounded-t-3xl">
            <h2 className="text-lg font-bold">
              {t("products.filterProducts")}
            </h2>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="overflow-y-auto pb-8"
            style={{ maxHeight: "calc(85vh - 120px)" }}
          >
            <ProductFilters
              onFilterChange={handleFilterChange}
              isMobile={true}
              onClose={() => setIsMobileFilterOpen(false)}
              lang={t("common.lang")}
              categoryId={currentCategoryId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}