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
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// Types
// ============================================================================

/** A single product category returned by the API */
export interface CategoryOption {
  id: number;
  name: string;
}

/** A single color option returned by the API */
export interface ColorOption {
  id: number;
  name: string;
  code: string;
}

/** ✅ SizeOption مع ID و type */
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
  colors?: string[];
  attribute_values?: number[];  // ✅ تغيير من sizes إلى attribute_values
  brands?: number[];
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductFiltersProps {
  onFilterChange: (filters: AppliedFilters) => void;
  isMobile?: boolean;
  onClose?: () => void;
  lang?: string;
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
  selectedColors: string[];
  selectedAttributeIds: number[];  // ✅ تخزين IDs بدلاً من القيم النصية
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

// Colors that need a different selection ring because they blend into a
// white background (kept as Sets for O(1) lookups and easy extension).
const WHITE_COLOR_CODES = new Set(['#FFFFFF', '#F9FAFB']);
const WHITE_COLOR_NAMES = new Set(['أبيض', 'white']);

const initialFiltersState: FiltersSelectionState = {
  selectedCategories: [],
  selectedColors: [],
  selectedAttributeIds: [],  // ✅ تغيير من selectedSizes
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
    colors: state.selectedColors.length ? state.selectedColors : undefined,
    attribute_values: state.selectedAttributeIds.length ? state.selectedAttributeIds : undefined,  // ✅ إرسال IDs
    brands: state.selectedBrands.length ? state.selectedBrands : undefined,
  };

  if (state.appliedPriceRange) {
    filters.minPrice = state.appliedPriceRange[0];
    filters.maxPrice = state.appliedPriceRange[1];
  }

  return filters;
}

// ✅ دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      filter: 'Filter',
      clearAll: 'Clear All',
      prices: 'Prices',
      maxPrice: 'Max Price',
      minPrice: 'Min Price',
      categories: 'Categories',
      colors: 'Colors',
      specifications: 'Specifications (RAM / HDD)',
      brands: 'Brands',
      apply: 'Apply',
      loadingCategories: 'Loading categories...',
      loadingColors: 'Loading colors...',
      loadingSpecifications: 'Loading specifications...',
      loadingBrands: 'Loading brands...',
      ramPrefix: 'RAM: ',
      hddPrefix: 'HDD: ',
      le: 'EGP',
      // Colors in English (for white detection)
      white: 'white',
    };
  }
  // Arabic (default)
  return {
    filter: 'فلتر',
    clearAll: 'مسح الكل',
    prices: 'الاسعار',
    maxPrice: 'الحد الأقصى',
    minPrice: 'الحد الأدنى',
    categories: 'الفئات',
    colors: 'الألوان',
    specifications: 'المواصفات (RAM / HDD)',
    brands: 'العلامات التجارية',
    apply: 'تطبيق',
    loadingCategories: 'جاري تحميل الفئات...',
    loadingColors: 'جاري تحميل الألوان...',
    loadingSpecifications: 'جاري تحميل المواصفات...',
    loadingBrands: 'جاري تحميل العلامات التجارية...',
    ramPrefix: 'RAM: ',
    hddPrefix: 'HDD: ',
    le: 'ج.م',
    // Colors in Arabic (for white detection)
    white: 'أبيض',
  };
};

// ============================================================================
// Reducer
// ============================================================================

type FiltersAction =
  | { type: 'TOGGLE_CATEGORY'; payload: number }
  | { type: 'TOGGLE_COLOR'; payload: string }
  | { type: 'TOGGLE_ATTRIBUTE'; payload: number }  // ✅ تغيير من TOGGLE_SIZE
  | { type: 'TOGGLE_BRAND'; payload: number }
  | { type: 'SET_TEMP_PRICE_RANGE'; payload: PriceRange }
  | { type: 'APPLY_PRICE_FILTER' }
  | { type: 'RESET_ALL' }
  | { type: 'APPLY_ALL_FILTERS' }; // ✅ إضافة نوع جديد لتطبيق كل الفلاتر دفعة واحدة

function filtersReducer(state: FiltersSelectionState, action: FiltersAction): FiltersSelectionState {
  switch (action.type) {
    case 'TOGGLE_CATEGORY':
      return { ...state, selectedCategories: toggleInArray(state.selectedCategories, action.payload) };
    case 'TOGGLE_COLOR':
      return { ...state, selectedColors: toggleInArray(state.selectedColors, action.payload) };
    case 'TOGGLE_ATTRIBUTE':  // ✅ تغيير من TOGGLE_SIZE
      return { ...state, selectedAttributeIds: toggleInArray(state.selectedAttributeIds, action.payload) };
    case 'TOGGLE_BRAND':
      return { ...state, selectedBrands: toggleInArray(state.selectedBrands, action.payload) };
    case 'SET_TEMP_PRICE_RANGE':
      return { ...state, tempPriceRange: action.payload };
    case 'APPLY_PRICE_FILTER':
      return { ...state, appliedPriceRange: state.tempPriceRange };
    case 'APPLY_ALL_FILTERS':
      // ✅ تطبيق كل الفلاتر دفعة واحدة
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
  colors: ColorOption[];
  sizes: SizeOption[];
  brands: BrandOption[];
}

const EMPTY_FILTER_OPTIONS: FilterOptionsState = {
  categories: [],
  colors: [],
  sizes: [],
  brands: [],
};

function useFilterOptions(): FilterOptionsState {
  const [options, setOptions] = useState<FilterOptionsState>(EMPTY_FILTER_OPTIONS);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [categories, colors, sizes, brands] = await Promise.all([
          getCategories(),
          getColors(),
          getSizes(),
          getBrands(),
        ]);

        if (isMounted) {
          setOptions({ categories, colors, sizes, brands });
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
    <div className="py-4">
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
 * Generic checkbox list used for categories, sizes, and brands.
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
}: CheckboxFilterListProps<T, K>) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400">{loadingMessage}</p>;
  }

  return (
    <div className={`space-y-2  ${maxHeightClassName}`}>
      {items.map((item) => {
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
  );
}

const CheckboxFilterList = memo(CheckboxFilterListInner) as typeof CheckboxFilterListInner;

/** Color swatch grid */
interface ColorSwatchListProps {
  colors: ColorOption[];
  selectedColors: string[];
  onToggle: (code: string) => void;
  loadingMessage: string;
}

const ColorSwatchList = memo(function ColorSwatchList({
  colors,
  selectedColors,
  onToggle,
  loadingMessage,
}: ColorSwatchListProps) {
  if (colors.length === 0) {
    return <p className="text-sm text-gray-400">{loadingMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
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
  );
});

// ============================================================================
// Main component
// ============================================================================

export default function ProductFilters({ onFilterChange, isMobile = false, onClose, lang: propLang }: ProductFiltersProps) {
  const { language: contextLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  
  // ✅ استخدام ref لتخزين onFilterChange
  const onFilterChangeRef = useRef(onFilterChange);
  
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // ✅ دالة مساعدة للحصول على النص المناسب
  const getText = useCallback((ar: string, en: string) => {
    if (!isClient) return ar; // على السيرفر استخدم العربية دائماً
    const lang = propLang || contextLanguage || 'ar';
    return lang === 'en' ? en : ar;
  }, [isClient, propLang, contextLanguage]);

  const [state, dispatch] = useReducer(filtersReducer, initialFiltersState);
  const { categories, colors, sizes, brands } = useFilterOptions();

  const [tempMinPrice, tempMaxPrice] = state.tempPriceRange;

  // ✅ دالة تطبيق الفلاتر (تُستخدم للموبايل والديسكتوب)
  const applyFilters = useCallback(() => {
    // تطبيق الفلاتر الحالية
    dispatch({ type: 'APPLY_ALL_FILTERS' });
    
    // إرسال الفلاتر إلى المكون الأب
    const filtersToApply = buildAppliedFilters({
      ...state,
      appliedPriceRange: state.tempPriceRange,
    });
    onFilterChangeRef.current(filtersToApply);
    
    // إغلاق الفلتر إذا كان في الموبايل
    if (isMobile && onClose) {
      onClose();
    }
  }, [state, isMobile, onClose]);

  // ✅ للديسكتوب: تطبيق الفلاتر فوراً عند التغيير (ما عدا السعر)
  useEffect(() => {
    if (!isMobile && onFilterChangeRef.current) {
      // في الديسكتوب نطبق الفلاتر فوراً (ما عدا السعر)
      const filters = buildAppliedFilters({
        ...state,
        appliedPriceRange: state.appliedPriceRange, // ✅ استخدم السعر المطبق وليس المؤقت
      });
      onFilterChangeRef.current(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.selectedCategories,
    state.selectedColors,
    state.selectedAttributeIds,
    state.selectedBrands,
    state.appliedPriceRange, // ✅ اعتمد على appliedPriceRange بدلاً من tempPriceRange
    isMobile,
  ]);

  // ---- Instant filter toggles ----
  const handleCategoryToggle = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: id });
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

  // ✅ تطبيق فلتر السعر فقط عند الضغط على السهم
  const handleApplyPriceFilter = useCallback(() => {
    // تطبيق السعر في الـ state
    dispatch({ type: 'APPLY_PRICE_FILTER' });
    
    // إرسال الفلاتر مع السعر المطبق إلى المكون الأب
    const filters = buildAppliedFilters({
      ...state,
      appliedPriceRange: state.tempPriceRange, // استخدم القيم المؤقتة كقيم مطبقة
    });
    onFilterChangeRef.current(filters);
  }, [state]);

  const handleResetFilters = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
    // إرسال الفلاتر الفارغة إلى المكون الأب
    onFilterChangeRef.current({});
    if (onClose && isMobile) onClose();
  }, [onClose, isMobile]);

  // ✅ دالة للحصول على لون الخلفية حسب النوع
  const getSizeBadgeColor = (size: SizeOption): string => {
    if (size.type === 'ram') return '#3B82F6'; // أزرق للرام
    if (size.type === 'hard-disk') return '#10B981'; // أخضر للهارد ديسك
    return '#9CA3AF'; // رمادي للافتراضي
  };

  // ✅ دالة للحصول على النص المعروض مع بادئة حسب اللغة
  const getSizeLabel = useCallback((size: SizeOption): string => {
    const ramPrefix = getText('RAM: ', 'RAM: ');
    const hddPrefix = getText('HDD: ', 'HDD: ');
    if (size.type === 'ram') return `${ramPrefix}${size.value}`;
    if (size.type === 'hard-disk') return `${hddPrefix}${size.value}`;
    return size.value;
  }, [getText]);

  // ✅ حساب عدد الفلاتر المختارة
  const getSelectedFiltersCount = useCallback(() => {
    let count = 0;
    if (state.selectedCategories.length) count += state.selectedCategories.length;
    if (state.selectedColors.length) count += state.selectedColors.length;
    if (state.selectedAttributeIds.length) count += state.selectedAttributeIds.length;
    if (state.selectedBrands.length) count += state.selectedBrands.length;
    // ✅ استخدم appliedPriceRange بدلاً من tempPriceRange
    if (state.appliedPriceRange) {
      const [min, max] = state.appliedPriceRange;
      if (min > MIN_PRICE || max < MAX_PRICE) count++;
    }
    return count;
  }, [state]);

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
    >
      <h3 className="text-[18.28px] mb-4 text-[#180100] flex justify-between items-center">
        {getText('فلتر', 'Filter')}
        <button
          onClick={handleResetFilters}
          className="text-sm text-[#666666] border py-[10px] px-[18px] rounded-full border-[#999999] font-normal"
        >
          {getText('مسح الكل', 'Clear All')}
        </button>
      </h3>

      {/* ===== فلتر السعر ===== */}
      <FilterSection title={getText('الاسعار', 'Prices')}>
        <div className="space-y-4">
          <p className="text-sm text-[#333333] flex justify-end gap-1">
            <span>{getText('ج.م', 'EGP')}</span>
            {tempMaxPrice.toLocaleString()}
            <span>-</span>
            <span>{getText('ج.م', 'EGP')}</span>
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
              <label className="block text-xs text-gray-500 mb-1">{getText('الحد الأقصى', 'Max Price')}</label>
              <input
                type="number"
                value={tempMaxPrice}
                onChange={handleMaxPriceInputChange}
                className="w-full px-3 py-2 border border-gray-3000 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">{getText('الحد الأدنى', 'Min Price')}</label>
              <input
                type="number"
                value={tempMinPrice}
                onChange={handleMinPriceInputChange}
                className="w-full px-3 py-2 border border-gray-3000 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* ✅ زر تطبيق السعر - يعمل فقط عند الضغط عليه */}
            {!isMobile && (
              <div className="mt-4">
                <button
                  onClick={handleApplyPriceFilter}
                  className="w-[32.89px] bg-[#2DA5F3] text-white py-2 rounded-[8px] transition-colors font-semibold flex items-center justify-center gap-2 hover:bg-[#1a8bd4]"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </FilterSection>

      {/* ===== فلتر الفئات ===== */}
      <FilterSection title={getText('الفئات', 'Categories')}>
        <CheckboxFilterList
          items={categories}
          selectedValues={state.selectedCategories}
          getKey={(category) => category.id}
          getLabel={(category) => category.name}
          onToggle={handleCategoryToggle}
          loadingMessage={getText('جاري تحميل الفئات...', 'Loading categories...')}
          maxHeightClassName="max-h-64"
        />
      </FilterSection>

      {/* ===== فلتر الألوان ===== */}
      <FilterSection title={getText('الألوان', 'Colors')}>
        <ColorSwatchList
          colors={colors}
          selectedColors={state.selectedColors}
          onToggle={handleColorToggle}
          loadingMessage={getText('جاري تحميل الألوان...', 'Loading colors...')}
        />
      </FilterSection>

      {/* ===== ✅ فلتر المواصفات (RAM / HDD) ===== */}
      <FilterSection title={getText('المواصفات (RAM / HDD)', 'Specifications (RAM / HDD)')}>
        <CheckboxFilterList
          items={sizes}
          selectedValues={state.selectedAttributeIds}
          getKey={(size) => size.id}
          getLabel={getSizeLabel}
          onToggle={handleAttributeToggle}
          loadingMessage={getText('جاري تحميل المواصفات...', 'Loading specifications...')}
          maxHeightClassName="max-h-64"
          getBadgeColor={getSizeBadgeColor}
        />
      </FilterSection>

      {/* ===== فلتر العلامات التجارية ===== */}
      <FilterSection title={getText('العلامات التجارية', 'Brands')}>
        <CheckboxFilterList
          items={brands}
          selectedValues={state.selectedBrands}
          getKey={(brand) => brand.id}
          getLabel={(brand) => brand.name}
          onToggle={handleBrandToggle}
          loadingMessage={getText('جاري تحميل العلامات التجارية...', 'Loading brands...')}
          maxHeightClassName="max-h-48"
        />
      </FilterSection>

      {/* ✅ زر تطبيق الفلاتر (يظهر فقط في الموبايل) */}
      {isMobile && (
        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 -mx-4 px-4 mt-4">
          <button
            onClick={applyFilters}
            className="w-full bg-[#2D93CA] text-white py-3 rounded-[8px] font-semibold text-base transition-colors hover:bg-[#2479a8] flex items-center justify-center gap-2"
          >
            {getText('تطبيق', 'Apply')}
          </button>
        </div>
      )}
    </div>
  );
}