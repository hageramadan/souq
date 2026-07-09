// components/products/FilterSidebar.tsx
'use client';

import {
  useReducer,
  useEffect,
  useCallback,
  useState,
  memo,
  useRef,
  type ChangeEvent,
} from 'react';
import { getCategories, getColors, getSizes, getBrands } from '@/services/api';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { FaArrowLeft } from 'react-icons/fa6';
import { useTranslation } from '@/hooks/useTranslation';
import type { CategoryData, Brand } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// Types
// ============================================================================

/** A single product category returned by the API */
export interface CategoryOption {
  id: number;
  name: string;
  subcategories?: SubCategoryOption[];
  brands?: BrandOption[]; // ✅ براندات القسم
}

/** ✅ إضافة نوع الفئات الفرعية */
export interface SubCategoryOption {
  id: number;
  name: string;
}

/** A single color option returned by the API */
export interface ColorOption {
  id: number;
  name: string;
  code: string;
}

/** SizeOption مع ID و type */
export interface SizeOption {
  id: number;
  value: string;
  type?: 'ram' | 'hard-disk';
}

/** A single brand option returned by the API */
export interface BrandOption {
  id: number;
  name: string;
}

/** Shape of the filters object emitted to the parent via onFilterChange. */
export interface AppliedFilters {
  categoryIds?: number[];
  subcategoryIds?: number[];
  colors?: string[];
  attribute_values?: number[];
  brands?: number[];
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductFiltersProps {
  onFilterChange: (filters: AppliedFilters) => void;
  isMobile?: boolean;
  onClose?: () => void;
  lang?: string;
  categoryId?: number | null;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

type PriceRange = [number, number];

/** Internal selection state managed by the reducer. */
interface FiltersSelectionState {
  selectedCategories: number[];
  selectedSubcategories: number[];
  selectedColors: string[];
  selectedAttributeIds: number[];
  selectedBrands: number[];
  tempPriceRange: PriceRange;
  appliedPriceRange: PriceRange | undefined;
}

// ============================================================================
// Constants
// ============================================================================

const MIN_PRICE = 0;
const MAX_PRICE = 100_000;
const DEFAULT_PRICE_RANGE: PriceRange = [3000, 10000];
const INITIAL_DISPLAY_COUNT = 4; // ✅ عدد العناصر المعروضة في البداية

// Colors that need a different selection ring because they blend into a
// white background (kept as Sets for O(1) lookups and easy extension).
const WHITE_COLOR_CODES = new Set(['#FFFFFF', '#F9FAFB']);
const WHITE_COLOR_NAMES = new Set(['أبيض', 'white']);

const initialFiltersState: FiltersSelectionState = {
  selectedCategories: [],
  selectedSubcategories: [],
  selectedColors: [],
  selectedAttributeIds: [],
  selectedBrands: [],
  tempPriceRange: DEFAULT_PRICE_RANGE,
  appliedPriceRange: undefined,
};

// ============================================================================
// Pure helpers
// ============================================================================

/** Adds or removes a value from an array — used by every checkbox toggle. */
function toggleInArray<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** True if a color swatch should be treated as "white" for ring styling. */
function isWhiteColor(name: string, code: string): boolean {
  return WHITE_COLOR_NAMES.has(name) || WHITE_COLOR_CODES.has(code);
}

/**
 * Builds the filters object sent to the parent component.
 */
function buildAppliedFilters(state: FiltersSelectionState): AppliedFilters {
  const filters: AppliedFilters = {
    categoryIds: state.selectedCategories.length ? state.selectedCategories : undefined,
    subcategoryIds: state.selectedSubcategories.length ? state.selectedSubcategories : undefined,
    colors: state.selectedColors.length ? state.selectedColors : undefined,
    attribute_values: state.selectedAttributeIds.length ? state.selectedAttributeIds : undefined,
    brands: state.selectedBrands.length ? state.selectedBrands : undefined,
  };

  if (state.appliedPriceRange) {
    filters.minPrice = state.appliedPriceRange[0];
    filters.maxPrice = state.appliedPriceRange[1];
  }

  return filters;
}

// ============================================================================
// Reducer
// ============================================================================

type FiltersAction =
  | { type: 'TOGGLE_CATEGORY'; payload: number }
  | { type: 'TOGGLE_SUBCATEGORY'; payload: number }
  | { type: 'TOGGLE_COLOR'; payload: string }
  | { type: 'TOGGLE_ATTRIBUTE'; payload: number }
  | { type: 'TOGGLE_BRAND'; payload: number }
  | { type: 'SET_TEMP_PRICE_RANGE'; payload: PriceRange }
  | { type: 'APPLY_PRICE_FILTER' }
  | { type: 'RESET_ALL' }
  | { type: 'APPLY_ALL_FILTERS' };

function filtersReducer(state: FiltersSelectionState, action: FiltersAction): FiltersSelectionState {
  switch (action.type) {
    case 'TOGGLE_CATEGORY':
      return { ...state, selectedCategories: toggleInArray(state.selectedCategories, action.payload) };
    case 'TOGGLE_SUBCATEGORY':
      return { ...state, selectedSubcategories: toggleInArray(state.selectedSubcategories, action.payload) };
    case 'TOGGLE_COLOR':
      return { ...state, selectedColors: toggleInArray(state.selectedColors, action.payload) };
    case 'TOGGLE_ATTRIBUTE':
      return { ...state, selectedAttributeIds: toggleInArray(state.selectedAttributeIds, action.payload) };
    case 'TOGGLE_BRAND':
      return { ...state, selectedBrands: toggleInArray(state.selectedBrands, action.payload) };
    case 'SET_TEMP_PRICE_RANGE':
      return { ...state, tempPriceRange: action.payload };
    case 'APPLY_PRICE_FILTER':
      return { ...state, appliedPriceRange: state.tempPriceRange };
    case 'APPLY_ALL_FILTERS':
      return { 
        ...state, 
        appliedPriceRange: state.tempPriceRange 
      };
    case 'RESET_ALL':
      return initialFiltersState;
    default:
      return state;
  }
}

// ============================================================================
// Data-loading hook
// ============================================================================

interface FilterOptionsState {
  categories: CategoryOption[];
  allSubcategories: SubCategoryOption[];
  colors: ColorOption[];
  sizes: SizeOption[];
  brands: BrandOption[];
  categoryBrands: { [categoryId: number]: BrandOption[] }; // ✅ براندات كل قسم
}

const EMPTY_FILTER_OPTIONS: FilterOptionsState = {
  categories: [],
  allSubcategories: [],
  colors: [],
  sizes: [],
  brands: [],
  categoryBrands: {}, // ✅ إضافة
};

function useFilterOptions(): FilterOptionsState {
  const [options, setOptions] = useState<FilterOptionsState>(EMPTY_FILTER_OPTIONS);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [categoriesData, colors, sizes, brands] = await Promise.all([
          getCategories(),
          getColors(),
          getSizes(),
          getBrands(),
        ]);

        if (isMounted) {
          // ✅ استخراج جميع الفئات الفرعية من جميع الفئات الرئيسية
          const allSubcategories = categoriesData.flatMap(
            (cat: CategoryData) => cat.subcategories || []
          );
          
          // ✅ بناء خريطة البراندات لكل قسم
          const categoryBrands: { [categoryId: number]: BrandOption[] } = {};
          categoriesData.forEach((cat: CategoryData) => {
            if (cat.brands && cat.brands.length > 0) {
              categoryBrands[cat.id] = cat.brands.map((b: Brand) => ({
                id: b.id,
                name: b.name
              }));
            }
          });
          
          setOptions({ 
            categories: categoriesData.map((cat: CategoryData) => ({
              id: cat.id,
              name: cat.name,
              subcategories: cat.subcategories,
              brands: cat.brands || [] // ✅ إضافة براندات القسم
            })),
            allSubcategories,
            colors, 
            sizes, 
            brands, // البراندات العامة
            categoryBrands, // ✅ براندات كل قسم
          });
        }
      } catch (error) {
        console.error('Error loading filters data:', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return options;
}

// ============================================================================
// Presentational sub-components
// ============================================================================

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-right font-semibold text-gray-700 mb-2"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

/**
 * ✅ CheckboxFilterList مع ميزة عرض 4 عناصر فقط + زر عرض المزيد ونص إضافي
 */
interface CheckboxFilterListProps<T, K extends string | number> {
  items: T[];
  selectedValues: K[];
  getKey: (item: T) => K;
  getLabel: (item: T) => string;
  onToggle: (key: K) => void;
  loadingMessage: string;
  maxHeightClassName?: string;
  getBadgeColor?: (item: T) => string;
  showMoreText?: string;
  showLessText?: string;
  moreCategoriesText?: string;
  initialDisplayCount?: number;
}

function CheckboxFilterListInner<T, K extends string | number>({
  items,
  selectedValues,
  getKey,
  getLabel,
  onToggle,
  loadingMessage,
  maxHeightClassName = 'max-h-64',
  getBadgeColor,
  showMoreText = 'عرض المزيد',
  showLessText = 'عرض أقل',
  moreCategoriesText = 'عناصر أخرى',
  initialDisplayCount = 4,
}: CheckboxFilterListProps<T, K>) {
  const [showAll, setShowAll] = useState(false);

  if (items.length === 0) {
    return <p className="text-sm text-gray-400">{loadingMessage}</p>;
  }

  // ✅ تحديد العناصر المعروضة
  const displayItems = showAll ? items : items.slice(0, initialDisplayCount);
  const hasMoreItems = items.length > initialDisplayCount;
  const hiddenCount = items.length - initialDisplayCount;

  return (
    <div className="space-y-2">
      <div className={`space-y-2 overflow-y-auto ${maxHeightClassName}`}>
        {displayItems.map((item) => {
          const key = getKey(item);
          const label = getLabel(item);
          const badgeColor = getBadgeColor?.(item);
          
          return (
            <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedValues.includes(key)}
                onChange={() => onToggle(key)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              {badgeColor && (
                <span 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: badgeColor }}
                />
              )}
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          );
        })}
      </div>

      {/* ✅ زر عرض المزيد/عرض أقل مع النص الإضافي */}
      {hasMoreItems && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-2 transition-colors"
        >
          {showAll ? (
            <>
              {showLessText}
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              {showMoreText}
              <span className="text-gray-500 font-normal">
                + {hiddenCount} {moreCategoriesText}
              </span>
              <ChevronDown size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

const CheckboxFilterList = memo(CheckboxFilterListInner) as typeof CheckboxFilterListInner;

/** Color swatch grid */
interface ColorSwatchListProps {
  colors: ColorOption[];
  selectedColors: string[];
  onToggle: (code: string) => void;
  loadingMessage: string;
  showMoreText?: string;
  showLessText?: string;
  moreCategoriesText?: string;
  initialDisplayCount?: number;
}

const ColorSwatchList = memo(function ColorSwatchList({
  colors,
  selectedColors,
  onToggle,
  loadingMessage,
  showMoreText = 'عرض المزيد',
  showLessText = 'عرض أقل',
  moreCategoriesText = 'عناصر أخرى',
  initialDisplayCount = 4,
}: ColorSwatchListProps) {
  const [showAll, setShowAll] = useState(false);

  if (colors.length === 0) {
    return <p className="text-sm text-gray-400">{loadingMessage}</p>;
  }

  const displayColors = showAll ? colors : colors.slice(0, initialDisplayCount);
  const hasMoreColors = colors.length > initialDisplayCount;
  const hiddenCount = colors.length - initialDisplayCount;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {displayColors.map((color) => {
          const isSelected = selectedColors.includes(color.code);
          const isWhite = isWhiteColor(color.name, color.code);

          return (
            <button
              key={color.id}
              onClick={() => onToggle(color.code)}
              className="group relative"
              aria-label={`Color ${color.name}`}
            >
              <div
                className={`
                  w-7 h-7 rounded-full transition-all duration-200 hover:scale-110
                  ${isSelected ? 'ring-2 ring-offset-2 scale-110' : ''}
                  ${isSelected && isWhite ? 'ring-black ring-offset-white' : isSelected ? 'ring-blue-500' : ''}
                `}
                style={{
                  backgroundColor: color.code,
                  ...(isWhite && { border: '1px solid #e5e7eb' }),
                }}
              />
            </button>
          );
        })}
      </div>

      {/* ✅ زر عرض المزيد/عرض أقل مع النص الإضافي للألوان */}
      {hasMoreColors && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-2 transition-colors"
        >
          {showAll ? (
            <>
              {showLessText}
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              {showMoreText}
              <span className="text-gray-500 font-normal">
                + {hiddenCount} {moreCategoriesText}
              </span>
              <ChevronDown size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
});

// ============================================================================
// Main component
// ============================================================================

export default function ProductFilters({ onFilterChange, isMobile = false, onClose, lang: propLang ,categoryId: propCategoryId = null}: ProductFiltersProps) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  const {language} = useLanguage(); // ✅ الحصول على اللغة الحالية
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null); // ✅ لتتبع الفئة المختارة
  const [isClient, setIsClient] = useState(false);
  const onFilterChangeRef = useRef(onFilterChange);
    useEffect(() => {
    setSelectedCategoryId(propCategoryId);
  }, [propCategoryId]);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  const [state, dispatch] = useReducer(filtersReducer, initialFiltersState);
  const { categories, allSubcategories, colors, sizes, brands, categoryBrands } = useFilterOptions();

  const [tempMinPrice, tempMaxPrice] = state.tempPriceRange;

  // ✅ الحصول على البراندات الخاصة بالقسم المختار - التعديل الرئيسي
  const getBrandsForSelectedCategory = useCallback(() => {
    // إذا تم اختيار فئة
    if (selectedCategoryId !== null) {
      // تحقق مما إذا كانت الفئة لديها براندات
      const categoryBrandsList = categoryBrands[selectedCategoryId];
      if (categoryBrandsList && categoryBrandsList.length > 0) {
        return categoryBrandsList; // ✅ عرض براندات الفئة فقط
      }
      // إذا كانت الفئة ليس لديها براندات، ارجع مصفوفة فارغة
      return [];
    }
    // إذا لم يتم اختيار فئة، استخدم البراندات العامة
    return brands;
  }, [selectedCategoryId, categoryBrands, brands]);

  const applyFilters = useCallback(() => {
    dispatch({ type: 'APPLY_ALL_FILTERS' });
    
    const filtersToApply = buildAppliedFilters({
      ...state,
      appliedPriceRange: state.tempPriceRange,
    });
    onFilterChangeRef.current(filtersToApply);
    
    if (isMobile && onClose) {
      onClose();
    }
  }, [state, isMobile, onClose]);

  // ✅ للديسكتوب: تطبيق الفلاتر فوراً عند التغيير
  useEffect(() => {
    if (!isMobile && onFilterChangeRef.current) {
      const filters = buildAppliedFilters({
        ...state,
        appliedPriceRange: state.appliedPriceRange,
      });
      onFilterChangeRef.current(filters);
    }
  }, [
    state.selectedCategories,
    state.selectedSubcategories,
    state.selectedColors,
    state.selectedAttributeIds,
    state.selectedBrands,
    state.appliedPriceRange,
    isMobile,
  ]);

  // ---- Instant filter toggles ----
  const handleCategoryToggle = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: id });
    
    // ✅ تحديث الفئة المختارة لعرض برانداتها
    setSelectedCategoryId(prevId => {
      // إذا كانت نفس الفئة تم إلغاء اختيارها
      if (prevId === id) {
        const isStillSelected = state.selectedCategories.includes(id);
        if (!isStillSelected) {
          return null;
        }
        return prevId;
      }
      return id;
    });
  }, [state.selectedCategories]);

  const handleSubcategoryToggle = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_SUBCATEGORY', payload: id });
  }, []);

  const handleColorToggle = useCallback((code: string) => {
    dispatch({ type: 'TOGGLE_COLOR', payload: code });
  }, []);

  const handleAttributeToggle = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_ATTRIBUTE', payload: id });
  }, []);

  const handleBrandToggle = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_BRAND', payload: id });
  }, []);

  // ---- Price handlers ----
  const handlePriceSliderChange = useCallback((value: number[]) => {
    dispatch({ type: 'SET_TEMP_PRICE_RANGE', payload: [value[0], value[1]] });
  }, []);

  const handleMaxPriceInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value <= MAX_PRICE && value >= tempMinPrice) {
      dispatch({ type: 'SET_TEMP_PRICE_RANGE', payload: [tempMinPrice, value] });
    }
  };

  const handleMinPriceInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value >= MIN_PRICE && value <= tempMaxPrice) {
      dispatch({ type: 'SET_TEMP_PRICE_RANGE', payload: [value, tempMaxPrice] });
    }
  };

  const handleApplyPriceFilter = useCallback(() => {
    dispatch({ type: 'APPLY_PRICE_FILTER' });
    
    const filters = buildAppliedFilters({
      ...state,
      appliedPriceRange: state.tempPriceRange,
    });
    onFilterChangeRef.current(filters);
  }, [state]);

  const handleResetFilters = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
    setSelectedCategoryId(null); // ✅ إعادة تعيين الفئة المختارة
    onFilterChangeRef.current({});
    if (onClose && isMobile) onClose();
  }, [onClose, isMobile]);

  // ✅ دالة للحصول على لون الخلفية حسب النوع
  const getSizeBadgeColor = (size: SizeOption): string => {
    if (size.type === 'ram') return '#3B82F6';
    if (size.type === 'hard-disk') return '#10B981';
    return '#9CA3AF';
  };

  const getSizeLabel = useCallback((size: SizeOption): string => {
    if (size.type === 'ram') return `${t('filter.ramPrefix')}${size.value}`;
    if (size.type === 'hard-disk') return `${t('filter.hddPrefix')}${size.value}`;
    return size.value;
  }, [t]);

  // ✅ الحصول على النصوص المترجمة من الـ t
  const showMoreText = t('filter.showMore');
  const showLessText = t('filter.showLess');
  const moreCategoriesText = t('filter.moreCategories');
  const moreBrandsText = t('filter.moreBrands');

  // ✅ الحصول على البراندات المعروضة
  const displayBrands = getBrandsForSelectedCategory();
  
  // ✅ التحقق مما إذا كانت البراندات خاصة بقسم معين
  const isCategorySpecificBrands = selectedCategoryId !== null && categoryBrands[selectedCategoryId]?.length > 0;
  
  // ✅ الحصول على اسم القسم المختار
  const selectedCategoryName = categories.find(c => c.id === selectedCategoryId)?.name || '';

  return (
    <div
      className={`
        border rounded-[8px] p-4
        ${
          isMobile
            ? 'w-full max-h-[calc(100vh-80px)] my-0 border-0 rounded-none'
            : 'sticky top-[10%] mx-auto my-3 w-[340px]'
        }
      `}
      suppressHydrationWarning 
    >
      <h3 className="text-[18.28px] mb-4 text-[#180100] flex justify-between items-center">
        {t('filter.title')}
        <button
          onClick={handleResetFilters}
          className="text-sm text-[#666666] border py-[10px] px-[18px] rounded-full border-[#999999] font-normal"
        >
          {t('filter.clearAll')}
        </button>
      </h3>

      {/* ===== فلتر السعر ===== */}
      <FilterSection title={t('filter.prices')}>
        <div className="space-y-4">
          <p className="text-sm text-[#333333] flex justify-end gap-1">
            <span>{t('filter.currency')}</span>
            {tempMaxPrice.toLocaleString()}
            <span>-</span>
            <span>{t('filter.currency')}</span>
            {tempMinPrice.toLocaleString()}
          </p>

          <Slider
            value={state.tempPriceRange}
            onValueChange={handlePriceSliderChange}
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={10}
            className="my-6"
          />

          <div className="flex gap-3 mt-2 items-center">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">{t('filter.maxPrice')}</label>
              <input
                type="number"
                value={tempMaxPrice}
                onChange={handleMaxPriceInputChange}
                className="w-full px-3 py-2 border border-gray-3000 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">{t('filter.minPrice')}</label>
              <input
                type="number"
                value={tempMinPrice}
                onChange={handleMinPriceInputChange}
                className="w-full px-3 py-2 border border-gray-3000 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!isMobile && (
              <div className="mt-4">
                <button
                  onClick={handleApplyPriceFilter}
                  className="w-[32.89px] bg-[#2DA5F3] text-white py-2 rounded-[8px] transition-colors font-semibold flex items-center justify-center gap-2 hover:bg-[#1a8bd4]"
                >
                  <FaArrowLeft 
                    className={`h-4 w-4 ${isClient && language === 'en' ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </FilterSection>

      {/* ===== فلتر الفئات ===== */}
      {categories.length > 0 && (
          <FilterSection title={t('filter.categories')}>
        <CheckboxFilterList
          items={categories}
          selectedValues={state.selectedCategories}
          getKey={(category) => category.id}
          getLabel={(category) => category.name}
          onToggle={handleCategoryToggle}
          loadingMessage={t('filter.loadingCategories')}
          maxHeightClassName="max-h-64"
          showMoreText={showMoreText}
          showLessText={showLessText}
          moreCategoriesText={moreCategoriesText}
          initialDisplayCount={4}
        />
      </FilterSection>
      )}
    

      {/* ===== ✅ فلتر الفئات الفرعية ===== */}
      {allSubcategories.length > 0 && (
        <FilterSection title={t('filter.subcategories')}>
          <CheckboxFilterList
            items={allSubcategories}
            selectedValues={state.selectedSubcategories}
            getKey={(sub) => sub.id}
            getLabel={(sub) => sub.name}
            onToggle={handleSubcategoryToggle}
            loadingMessage={t('filter.loadingSubcategories')}
            maxHeightClassName="max-h-64"
            showMoreText={showMoreText}
            showLessText={showLessText}
            moreCategoriesText={moreCategoriesText}
            initialDisplayCount={4}
          />
        </FilterSection>
      )}

      {/* ===== فلتر الألوان ===== */}
      {
        colors.length > 0 && (
          <FilterSection title={t('filter.colors')}>
        <ColorSwatchList
          colors={colors}
          selectedColors={state.selectedColors}
          onToggle={handleColorToggle}
          loadingMessage={t('filter.loadingColors')}
          showMoreText={showMoreText}
          showLessText={showLessText}
          moreCategoriesText={moreCategoriesText}
          initialDisplayCount={4}
        />
      </FilterSection>
        )
      }

      {/* ===== فلتر المواصفات (RAM / HDD) ===== */}
      {sizes.length > 0 && (
         <FilterSection title={t('filter.specifications')}>
        <CheckboxFilterList
          items={sizes}
          selectedValues={state.selectedAttributeIds}
          getKey={(size) => size.id}
          getLabel={getSizeLabel}
          onToggle={handleAttributeToggle}
          loadingMessage={t('filter.loadingSpecifications')}
          maxHeightClassName="max-h-64"
          getBadgeColor={getSizeBadgeColor}
          showMoreText={showMoreText}
          showLessText={showLessText}
          moreCategoriesText={moreCategoriesText}
          initialDisplayCount={4}
        />
      </FilterSection>
      )}
     

      {/* ===== ✅ فلتر العلامات التجارية - براندات القسم المختار ===== */}
     
        {displayBrands.length > 0 && (
           <FilterSection title={t('filter.brands')}>
          <div className="space-y-2">
            
            <CheckboxFilterList
              items={displayBrands}
              selectedValues={state.selectedBrands}
              getKey={(brand) => brand.id}
              getLabel={(brand) => brand.name}
              onToggle={handleBrandToggle}
              loadingMessage={t('filter.loadingBrands')}
              maxHeightClassName="max-h-48"
              showMoreText={showMoreText}
              showLessText={showLessText}
              moreCategoriesText={moreBrandsText}
              initialDisplayCount={4}
            />
          </div>
          </FilterSection>
        )}
      

      {/* ✅ زر تطبيق الفلاتر (يظهر فقط في الموبايل) */}
      {isMobile && (
        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 -mx-4 px-4 mt-4">
          <button
            onClick={applyFilters}
            className="w-full bg-[#2D93CA] text-white py-3 rounded-[8px] font-semibold text-base transition-colors hover:bg-[#2479a8] flex items-center justify-center gap-2"
          >
            {t('filter.apply')}
          </button>
        </div>
      )}
    </div>
  );
}