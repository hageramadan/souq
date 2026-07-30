'use client';

import { useState, useEffect } from 'react';
import { ProductDetails } from '@/components/products/ProductDetails';
import { 
  getProductById, 
  extractColorsFromProduct, 
  extractSizesFromProduct,
  getFinalPrice,
  getOriginalPrice,
  getDiscountPercentage,
  ProductData 
} from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { YouMayAlsoLike } from '@/components/home/YouMayAlsoLike';
import { CustomerReviews } from '@/components/products/CustomerReviews';
import { useLanguage } from '@/contexts/LanguageContext';

// الحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      loading: "Loading product...",
      error: "Error loading product",
      productNotFound: "Product not found",
      backToHome: "Back to Home",
      defaultBrand: "Brand",
      defaultCategory: "Product",
      defaultColorName: "Blue",
      defaultColorName2: "Navy",
      defaultColorName3: "Green",
    };
  }
  return {
    loading: "جاري تحميل المنتج...",
    error: "حدث خطأ أثناء تحميل المنتج",
    productNotFound: "المنتج غير موجود",
    backToHome: "العودة إلى الرئيسية",
    defaultBrand: "ماركة",
    defaultCategory: "منتج",
    defaultColorName: "أزرق",
    defaultColorName2: "كحلي",
    defaultColorName3: "أخضر",
  };
};

// تحويل بيانات الـ API إلى الشكل المطلوب للـ ProductDetails
const transformProductData = (apiProduct: ProductData, language: string) => {
  const t = getTranslations(language);
  
  const colors = extractColorsFromProduct(apiProduct);
  const sizes = extractSizesFromProduct(apiProduct);
  const finalPrice = getFinalPrice(apiProduct);
  const originalPrice = getOriginalPrice(apiProduct);
  const discountPercentage = getDiscountPercentage(apiProduct);
  
  // ✅ حساب isMostRequested من orders_num
  const isMostRequested = apiProduct.orders_num !== undefined && 
                          apiProduct.orders_num !== null && 
                          apiProduct.orders_num >= 10;
  
  // تنظيف رابط الصورة
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://admin.souqkaber.com${url}`;
    }
    return url;
  };

  // معالجة الصور
  const processedImages = apiProduct.images?.map(cleanImageUrl) || ["/images/placeholder.jpg"];
  
  // إذا لم يكن هناك ألوان، أضف ألوان افتراضية حسب اللغة
  const finalColors = colors.length > 0 ? colors : [
    { name: t.defaultColorName, code: "#23A6F0" },
    { name: t.defaultColorName2, code: "#252B42" },
    { name: t.defaultColorName3, code: "#23856D" },
  ];
  
  // إذا لم يكن هناك مقاسات، أضف مقاسات افتراضية
  const finalSizes = sizes.length > 0 ? sizes : ["S", "M", "L", "XL"];
  
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description,
    price: finalPrice,
    originalPrice: originalPrice || undefined,
    discount: discountPercentage || undefined,
    brand: apiProduct.brand?.name || apiProduct.category?.name || t.defaultBrand,
    category: apiProduct.category?.name || t.defaultCategory,
    images: processedImages,
    colors: finalColors,
    sizes: finalSizes,
    rating: apiProduct.avg_rating || 4.5,
    reviewsCount: apiProduct.total_reviews || 0,
    sku: `SKU-${apiProduct.id}`,
    availability: apiProduct.is_active && ((apiProduct.quantity ?? 0) > 0 || apiProduct.has_variants),
    variants: apiProduct.variants || [],
    has_variants: apiProduct.has_variants || false,
    video: apiProduct.video || null,
    isMostRequested: isMostRequested, // ✅ أضف هذه الخاصية
    quantity: apiProduct.quantity ?? 0, // ✅ أضف الكمية
  };
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setProductId(unwrappedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiProduct = await getProductById(productId);
        
        if (apiProduct) {
          const transformedProduct = transformProductData(apiProduct, language);
          setProduct(transformedProduct);
        } else {
          setError(t.productNotFound);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId, language, t.error, t.productNotFound]);

  if (loading) {
    return (
      <div className="min-h-screen page-with-padding flex items-center justify-center">
        <LoadingSpinner size="lg" text={""} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen page-with-padding flex flex-col items-center justify-center">
        <p className="text-red-500 text-xl mb-4">{error || t.productNotFound}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-[#23A6F0] text-white px-6 py-2 rounded-[8px] hover:bg-[#1a8fd4] transition-all duration-300"
        >
          {t.backToHome}
        </button>
      </div>
    );
  }

  return (
    <div className='page-with-padding'>
      <ProductDetails product={product} />
      <CustomerReviews productId={parseInt(productId!)} />
      <YouMayAlsoLike />
    </div>
  );
}