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
import {
  ProductVariant,
  extractColorsFromVariants,
  cleanImageUrl,
  Currency,
  transformProduct as transformProductBase,
} from "@/types/product";
import SubCategoriesSlider from "@/components/products/SubCategoriesSlider";
import SubCategoryCard from "@/components/products/SubCategoryCard";
// ============================================================================
// Types
// ============================================================================
interface SubCategory {
  id: number;
  name: string;
  image?: string;
  slug?: string;
  products_count?: number;
}
interface CategorySliderData {
  id: number;
  name: string;
  sliders?: SliderImage[];
  brands?: Array<{ id: number; name: string }>;
  sub_categories?: SubCategory[]; // ✅ إضافة الفئات الفرعية
}
interface FiltersState {
  categoryIds?: number[];
  subcategoryIds?: number[];
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
// Main Component
// ============================================================================

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const { t } = useTranslation();
const categoryIdsFromUrl = useMemo(() => {
  const value = searchParams.get("categories");

  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}, [searchParams]);

const subcategoryIdsFromUrl = useMemo(() => {
  const value = searchParams.get("subcategories");

  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}, [searchParams]);

  // ✅ حالات التحميل
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

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
  const [isCategorySpecificBrands, setIsCategorySpecificBrands] =
    useState(false);

  // حالة الترتيب
  const [sortBy, setSortBy] = useState<string>("all");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const perPage = 12;
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFilterChangeRef = useRef(false);

  // ✅ متغير عشان نعرف إذا كان أول تحميل
  const isInitialLoadRef = useRef(true);

  // ✅ إغلاق المنيو
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortOpen]);

  // ✅ ========== تحميل جميع البيانات بالتوازي ==========
  useEffect(() => {
    const loadAllData = async () => {
      setIsPageLoading(true);
      setIsProductsLoading(true);

      try {
        const categoriesParam = searchParams.get("categories");

        // ✅ 1️⃣ جلب البراندات والفئات بالتوازي (أسرع)
        const [brandsData, categoriesData] = await Promise.all([
          getBrands(),
          getCategories(),
        ]);

        setAllBrands(brandsData);

        // 2️⃣ معالجة بيانات الفئة
        if (categoriesParam) {
          try {
            const categoryIds = JSON.parse(categoriesParam);
            if (
              categoryIds &&
              Array.isArray(categoryIds) &&
              categoryIds.length > 0
            ) {
              const categoryId = categoryIds[0];
              setCurrentCategoryId(categoryId);
              setFilters((prev) => {
                if (
                  prev.categoryIds?.length === 1 &&
                  prev.categoryIds[0] === categoryId
                ) {
                  return prev;
                }

                return {
                  ...prev,
                  categoryIds: [categoryId],
                };
              });

              const category = categoriesData.find((c) => c.id === categoryId);

              if (category) {
                setCategoryName(category.name);

                if (category.sliders && category.sliders.length > 0) {
                  setCategorySliders(category.sliders);
                }
                if (
                  category.subcategories &&
                  category.subcategories.length > 0
                ) {
                  setSubCategories(category.subcategories);
                } else {
                  setSubCategories([]);
                }
                if (category.brands && category.brands.length > 0) {
                  setCategoryBrands(category.brands);
                  setIsCategorySpecificBrands(true);
                } else {
                  setCategoryBrands(brandsData);
                  setIsCategorySpecificBrands(false);
                }
              }
            }
          } catch (parseError) {
            console.error("Error parsing categories param:", parseError);
            setCategoryBrands(brandsData);
            setIsCategorySpecificBrands(false);
            setCategoryName(null);
            setCategorySliders([]);
            setCurrentCategoryId(null);
            setFilters({});
          }
        } else {
          setCategoryBrands(brandsData);
          setIsCategorySpecificBrands(false);
          setCategoryName(null);
          setCategorySliders([]);
          setCurrentCategoryId(null);
          setFilters({});
        }

        // ✅ انتهى تحميل السلايدر والبراندات
        setIsPageLoading(false);

        // ✅ أول تحميل خلص
        isInitialLoadRef.current = false;

        // 3️⃣ تحميل المنتجات (بعد تحديد الفلاتر)
        // await loadProducts();
      } catch (error) {
        console.error("Error loading data:", error);
        setIsPageLoading(false);
        setIsProductsLoading(false);
        isInitialLoadRef.current = false;
      }
    };

    loadAllData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchParams]);

  // ✅ تحميل المنتجات - بدون useCallback لتجنب مشكلة React Compiler
  const loadProducts = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsProductsLoading(true);
    setLoading(true);

    try {
      const filterParams: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (sortBy !== "all") {
        filterParams.sort = sortBy;
      }
      const categoryIds =
        filters.categoryIds && filters.categoryIds.length > 0
          ? filters.categoryIds
          : categoryIdsFromUrl;

      if (categoryIds.length > 0) {
        filterParams.categories = categoryIds;
        console.log("🔍 Filtering by category:", categoryIds);
      }
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        filterParams.categories = filters.categoryIds;
        console.log("🔍 Filtering by category:", filters.categoryIds);
      }
      const subcategoryIds =
  filters.subcategoryIds && filters.subcategoryIds.length > 0
    ? filters.subcategoryIds
    : subcategoryIdsFromUrl;

if (subcategoryIds.length > 0) {
  filterParams.subcategories = subcategoryIds;

  console.log("🔍 Filtering by subcategory:", subcategoryIds);
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

      console.log("📦 Fetching products with params:", filterParams);

      const { products: productsData, pagination } =
        await getAllProducts(filterParams);

      if (!abortControllerRef.current?.signal.aborted) {
        setProducts(productsData);
        if (pagination) {
          setLastPage(pagination.last_page || 1);
          setTotalProducts(pagination.total || 0);
        }
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error("Error loading products:", error);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsProductsLoading(false);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
  if (isPageLoading) return;

  loadProducts();
}, [
  isPageLoading,
  currentPage,
  filters,
  selectedBrands,
  sortBy,
  categoryIdsFromUrl,
  subcategoryIdsFromUrl,
]);
  // ✅ معالج اختيار البراند
  const handleBrandToggle = useCallback((brandId: number) => {
    setSelectedBrands((prev) => {
      if (brandId === -1) return [];
      return prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId];
    });
    setCurrentPage(1);
  }, []);

  // ترتيب المنتجات
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

  const handleFilterChange = (newFilters: any) => {
    const updatedFilters: FiltersState = {};
    if (newFilters.categoryIds)
      updatedFilters.categoryIds = newFilters.categoryIds;
    if (newFilters.subcategoryIds)
  updatedFilters.subcategoryIds = newFilters.subcategoryIds;
    if (newFilters.colors) updatedFilters.colors = newFilters.colors;
    if (newFilters.attribute_values)
      updatedFilters.attribute_values = newFilters.attribute_values;
    if (newFilters.brands) setSelectedBrands(newFilters.brands);
    if (newFilters.minPrice !== undefined)
      updatedFilters.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice !== undefined)
      updatedFilters.maxPrice = newFilters.maxPrice;

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

  // ✅ تحويل المنتج - استخدام transformProductBase من types
  const transformProductForCard = (product: ProductData) => {
    // ✅ استخدم transformProductBase من types/product
    const transformed = transformProductBase(product);

    return {
      id: transformed.id,
      name: transformed.name,
      price: transformed.price,
      image: transformed.image,
      hoverImage: transformed.hoverImage || transformed.image,
      href: transformed.href,
      originalPrice: transformed.originalPrice,
      discount: transformed.discount,
      colors: transformed.colors || [],
      rating: transformed.rating || 0,
      reviewsCount: transformed.reviewsCount || 0,
      isMostRequested: transformed.isMostRequested || false,
      hasVariants: transformed.hasVariants || false,
      variants: transformed.variants || [],
      quantity: transformed.quantity || 0,
      currency: transformed.currency || {
        code: "EGP",
        symbol: "ج.م",
        name: "Egyptian Pound",
        rate: 1,
      },
    };
  };

  const displayBrands = useMemo(() => {
    if (currentCategoryId !== null && isCategorySpecificBrands) {
      return categoryBrands;
    }
    if (currentCategoryId !== null && !isCategorySpecificBrands) {
      return [];
    }
    return allBrands;
  }, [currentCategoryId, isCategorySpecificBrands, categoryBrands, allBrands]);

  // ✅ إذا كانت الصفحة في حالة تحميل
  if (isPageLoading) {
    return (
      <div className="min-h-screen page-with-padding">
        <div className="container mx-auto px-4 pb-16">
          {/* لودينج السلايدر */}
          <div className="mb-2">
            <div className="bg-gray-200 rounded-2xl h-[200px] lg:h-[500px] animate-pulse" />
          </div>

          {/* لودينج البراندات */}
          <div className="mb-2 bg-white ps-1 py-4 lg:ps-4 lg:p-4">
            <div className="flex gap-4 overflow-x-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 min-w-[100px] sm:min-w-[120px] md:min-w-[140px] px-3 py-2 rounded-full bg-gray-200 h-12 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* لودينج المنتجات + الفلتر */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="rounded-[8px] mb-3 flex justify-between items-center">
                <div className="flex justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-[8px] animate-pulse" />
                  </div>
                </div>
                <div className="w-32 h-10 bg-gray-200 rounded-[8px] animate-pulse" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64 mb-3" />
                    <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
                    <div className="bg-gray-200 h-4 rounded w-1/2" />
                    <div className="flex gap-1 mt-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden md:block w-[340px]">
              <div className="border rounded-[8px] p-4">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="mb-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="space-y-2">
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className="h-3 bg-gray-200 rounded w-3/4"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ عرض الصفحة
  return (
    <div className="min-h-screen">
      <style jsx>{`
        .sort-section1 {
          position: relative;
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

      <div className="flex items-end gap-1 container page-with-padding">
        <Link
          href="/"
          className="text-[#726C6C] text-lg lg:text-xl mb-2 lg:mb-5"
        >
          {t("products.home")}
        </Link>
        <span className="mb-2 lg:mb-5">/</span>
        <h1 className="text-base md:text-xl font-bold text-[#180100] mb-2 lg:mb-5">
          {categoryName ? ` ${categoryName}` : t("products.allProducts")}
        </h1>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* ✅ Category Slider */}
        {categorySliders.length > 0 && (
          <div className="mb-2" key={currentCategoryId}>
            <CategorySlider
              sliders={categorySliders}
              categoryName={categoryName || undefined}
              categoryId={currentCategoryId || undefined}
              autoplay={true}
              autoplayDelay={5000}
            />
          </div>
        )}
        {/* ✅ SubCategories Slider - جدداً */}
        {subCategories.length > 0 && (
          <div className=" ">
            <SubCategoriesSlider
              subCategories={subCategories}
              lang={t("common.lang")}
              showTitle={true}
              categoryId={currentCategoryId || undefined}
            />
          </div>
        )}
        {/* ✅ BrandSlider */}
        {categoryBrands.length > 0 && (
          <BrandSlider
            brands={displayBrands}
            selectedBrands={selectedBrands}
            onBrandToggle={handleBrandToggle}
            showCategoryBrandsLabel={isCategorySpecificBrands}
            categoryName={categoryName || undefined}
          />
        )}

        {/* ✅ Sort - Desktop */}
        <div className="sort-section1" ref={sortMenuRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="px-4 py-2 relative bg-white border border-gray-300 rounded-[8px] flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <BsArrowDownUp />
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
                t("common.dir") === "rtl" ? "end-3" : "start-3"
              }`}
            >
              {["all", "price_asc", "price_desc", "best_seller", "offers"].map(
                (value) => (
                  <button
                    key={value}
                    onClick={() => handleSortChange(value)}
                    className={`block w-full px-4 py-2 hover:bg-gray-100 transition-colors ${
                      sortBy === value
                        ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                        : "text-gray-700"
                    }`}
                  >
                    {t(
                      `products.sort${value.charAt(0).toUpperCase() + value.slice(1)}`,
                    )}
                  </button>
                ),
              )}
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
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#2D93CA] rounded-[8px] hover:bg-gray-200 transition-colors"
                  >
                    <VscSettings className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* ✅ Sort - Mobile */}
              <div className="sort-section2" ref={sortMenuRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-[8px] flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <BsArrowDownUp />
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
                      t("common.dir") === "rtl" ? "end-3" : "start-3"
                    }`}
                  >
                    {[
                      "all",
                      "price_asc",
                      "price_desc",
                      "best_seller",
                      "offers",
                    ].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleSortChange(value)}
                        className={`block w-full px-4 py-2 hover:bg-gray-100 transition-colors ${
                          sortBy === value
                            ? "bg-[#2D93CA] text-white hover:bg-gray-500 hover:text-gray-700"
                            : "text-gray-700"
                        }`}
                      >
                        {t(
                          `products.sort${value.charAt(0).toUpperCase() + value.slice(1)}`,
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isProductsLoading ? (
              <LoadingSpinner size="lg" text={t("products.loading")} />
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
                          isMostRequested={cardData.isMostRequested}
                          hasVariants={cardData.hasVariants}
                          variants={cardData.variants}
                          variantId={
                            cardData.hasVariants && cardData.variants.length > 0
                              ? cardData.variants[0].id
                              : null
                          }
                          currency={cardData.currency}
                          quantity={cardData.quantity}
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
        className={`fixed inset-0 z-30 md:hidden ${isMobileFilterOpen ? "block" : "hidden"}`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setIsMobileFilterOpen(false)}
        />
        <div
          className={`absolute bottom-0 end-3 start-3 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
            isMobileFilterOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "85vh", height: "auto" }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-50 rounded-t-3xl">
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
