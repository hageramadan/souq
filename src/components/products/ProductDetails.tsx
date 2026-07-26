// components/products/ProductDetails.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Heart,
  Truck,
  RefreshCw,
  Ruler,
  Info,
  HardDrive,
  MemoryStick,
  Play,
  X,
} from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsShare } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa6";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { FaRegStar } from "react-icons/fa";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

// ✅ إضافة واجهة العملة
interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

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

interface ProductDetailsProps {
  product: {
    id: number;
    avg_rating: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    brand: string | null;
    category: string;
    images: string[];
    colors: Array<{ name: string; code: string }>;
    sizes: string[];
    rating: number;
    reviewsCount: number;
    sku: string;
    availability: boolean;
    variants?: ProductVariant[];
    has_variants?: boolean;
    video?: string;
    currency?: Currency;
    quantity?: number | null; // ✅ إضافة الكمية الرئيسية للمنتج
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  // الحصول على الترجمات حسب اللغة
  const getTranslations = (lang: string) => {
    if (lang === 'en') {
      return {
        home: "Home",
        products: "Products",
        noBrand: "No Brand",
        EGP: "",
        review: "Review",
        color: "Color",
        ram: "RAM",
        hardDisk: "Hard Disk",
        quantity: "Quantity",
        addToCart: "Add to Cart",
        adding: "Adding...",
        favorites: "Favorites",
        addToFavorites: "Add to Favorites",
        productInfo: "Product Information",
        productCode: "Product Code",
        category: "Category",
        brand: "Brand",
        noVideo: "No video available for this product",
        onlyLeft: "Only {count} left",
        pleaseSelect: "Please select color, RAM and Hard Disk first",
        errorAdding: "Error adding product to cart",
        loginFirst: "Please login first to add products to favorites",
        backToImages: "Back to Images",
        closeVideo: "Close Video",
        playVideo: "Play Product Video",
        discount: "OFF",
        inStock: "In Stock",
        outOfStock: "Out of Stock",
        productVideo: "Video for {name}",
        notEnoughStock: "Not enough stock. Only {max} available.",
        maxQuantity: "Maximum quantity is {max}",
        availableQuantity: "Available Quantity",
      };
    }
    return {
      home: "الرئيسية",
      products: "المنتجات",
      noBrand: "بدون ماركة",
      EGP: "",
      review: "تقييم",
      color: "اللون",
      ram: "الرام (RAM)",
      hardDisk: "الهارد ديسك",
      quantity: "الكمية",
      addToCart: "أضف إلى السلة",
      adding: "جاري الإضافة...",
      favorites: "المفضلة",
      addToFavorites: "أضف للمفضلة",
      productInfo: "معلومات المنتج",
      productCode: "رمز المنتج",
      category: "القسم",
      brand: "الماركة",
      noVideo: "لا يوجد فيديو لهذا المنتج",
      onlyLeft: "⚠️ متبقي {count} فقط",
      pleaseSelect: "الرجاء اختيار اللون والرام والهارد ديسك أولاً",
      errorAdding: "حدث خطأ أثناء إضافة المنتج إلى السلة",
      loginFirst: "يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة",
      backToImages: "العودة للصور",
      closeVideo: "إغلاق الفيديو",
      playVideo: "تشغيل فيديو المنتج",
      discount: "خصم",
      inStock: "متوفر",
      outOfStock: " نفذ من المخزون",
      productVideo: "فيديو {name}",
      notEnoughStock: "الكمية المتاحة غير كافية. الحد الأقصى {max}.",
      maxQuantity: "الحد الأقصى للكمية هو {max}",
      availableQuantity: "الكمية المتاحة",
    };
  };

  const t = getTranslations(language);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedRam, setSelectedRam] = useState("");
  const [selectedHardDisk, setSelectedHardDisk] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "info" | "measurements" | "shipping"
  >("info");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  // ✅ حالة عرض الفيديو
  const [showVideo, setShowVideo] = useState(false);

  const videoRef = useRef<HTMLIFrameElement>(null);

  const { addItem, getItemQuantity, isLoading: cartLoading } = useCartContext();
  const { toggleFavorite, isFavorite, isMutating } = useFavorites();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // ✅ دوال التحقق من الكمية
  const getAvailableQuantity = (): number => {
    if (selectedVariant) {
      // إذا كان هناك متغير محدد، نأخذ الكمية من المتغير
      return selectedVariant.quantity ?? 0;
    }
    // إذا لم يكن هناك متغيرات، نأخذ الكمية من المنتج نفسه
    return product.quantity ?? 0;
  };

  const isProductAvailable = (): boolean => {
    const availableQty = getAvailableQuantity();
    return availableQty > 0;
  };

  const getMaxQuantity = (): number => {
    const availableQty = getAvailableQuantity();
    if (availableQty === 0) return 0;
    return Math.min(availableQty, 99);
  };

  // ✅ استخراج معرف الفيديو من رابط يوتيوب
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    const cleanUrl = url.split("?")[0];

    let videoId = null;

    const shortPattern = /youtu\.be\/([^\/\?]+)/;
    const shortMatch = cleanUrl.match(shortPattern);
    if (shortMatch) {
      videoId = shortMatch[1];
    }

    if (!videoId) {
      const longPattern = /youtube\.com\/watch\?v=([^\/\?&]+)/;
      const longMatch = url.match(longPattern);
      if (longMatch) {
        videoId = longMatch[1];
      }
    }

    if (!videoId) {
      const embedPattern = /youtube\.com\/embed\/([^\/\?]+)/;
      const embedMatch = url.match(embedPattern);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
    }

    return videoId;
  };

  // ✅ الحصول على رابط تضمين الفيديو
  const getEmbedVideoUrl = (videoUrl: string): string | null => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
      return null;
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1`;
  };

  // ✅ عرض الفيديو
  const showVideoPlayer = () => {
    if (!product.video) {
      toast.error(t.noVideo);
      return;
    }
    setShowVideo(true);
  };

  // ✅ إخفاء الفيديو والعودة للصورة
  const hideVideoPlayer = () => {
    setShowVideo(false);
    if (videoRef.current) {
      videoRef.current.src = "";
    }
  };

  // ✅ قائمة بجميع الأسماء المحتملة لكل attribute (تدعم العربية والإنجليزية)
  const COLOR_NAMES = ["لون", "اللون", "color", "Color", "colour", "Colour"];
  const RAM_NAMES = ["الذاكرة", "RAM", "ram", "ذاكرة", "memory", "Memory"];
  const HARD_DISK_NAMES = ["هارد ديسك", "Hard disk", "hard disk", "Hard Disk", "هارد", "harddrive", "HardDrive", "storage", "Storage"];

  // ✅ دالة مساعدة لتحويل hex code إلى اسم لون (لحالة العربية عندما تكون value = "-")
  const getColorNameFromHex = (hex: string): string => {
    const colorMap: { [key: string]: string } = {
      '#1A23A3': 'أزرق داكن',
      '#B5B7BB': 'رمادي فاتح',
      '#000000': 'أسود',
      '#FFFFFF': 'أبيض',
      '#FF0000': 'أحمر',
      '#00FF00': 'أخضر',
      '#0000FF': 'أزرق',
      '#FFFF00': 'أصفر',
      '#FF00FF': 'وردي',
      '#00FFFF': 'سماوي',
      '#FFA500': 'برتقالي',
      '#800080': 'بنفسجي',
      '#008000': 'أخضر غامق',
      '#808080': 'رمادي',
      '#A52A2A': 'بني',
    };
    
    const upperHex = hex.toUpperCase();
    return colorMap[upperHex] || `لون (${hex})`;
  };

  // ✅ دالة مساعدة للحصول على اسم اللون من attribute (يتعامل مع "-" و meta.color)
  const getColorDisplayName = (colorAttr: VariantAttribute): string => {
    // إذا كانت القيمة موجودة وغير "-"
    if (colorAttr.value && colorAttr.value !== "-" && colorAttr.value !== "") {
      return colorAttr.value;
    }
    
    // إذا كانت القيمة "-"، استخدم meta.color
    if (colorAttr.meta?.color) {
      // إذا كانت اللغة عربية، استخدم الاسم العربي من الـ map
      if (language === 'ar') {
        return getColorNameFromHex(colorAttr.meta.color);
      }
      // إذا كانت اللغة إنجليزية، استخدم الـ hex code كاسم
      return colorAttr.meta.color;
    }
    
    return 'Unknown Color';
  };

  // ✅ Extract colors from variants - تدعم جميع الحالات
  const getAvailableColorsFromVariants = (): {
    name: string;
    code: string;
    variants: ProductVariant[];
  }[] => {
    if (!product.variants || product.variants.length === 0) {
      return product.colors.map((c) => ({ ...c, variants: [] }));
    }

    const colorMap = new Map<
      string,
      { name: string; code: string; variants: ProductVariant[] }
    >();

    product.variants.forEach((variant) => {
      if (!variant.attributes) return;

      // البحث عن attribute اللون
      const colorAttr = variant.attributes.find(
        (attr) => COLOR_NAMES.includes(attr.attribute_type?.name)
      );

      if (colorAttr) {
        const colorName = getColorDisplayName(colorAttr);
        const colorCode = colorAttr.meta?.color || "#000000";

        if (!colorMap.has(colorName)) {
          colorMap.set(colorName, {
            name: colorName,
            code: colorCode,
            variants: [],
          });
        }

        colorMap.get(colorName)!.variants.push(variant);
      }
    });

    // ✅ إذا لم يتم العثور على أي ألوان، استخدم الألوان الافتراضية من product.colors
    if (colorMap.size === 0 && product.colors && product.colors.length > 0) {
      return product.colors.map((c) => ({ ...c, variants: [] }));
    }

    return Array.from(colorMap.values());
  };

  // ✅ Get RAM options for selected color
  const getAvailableRamForColor = (colorName: string): string[] => {
    if (!product.variants || product.variants.length === 0) {
      return [];
    }

    const ramOptions = new Set<string>();

    product.variants.forEach((variant) => {
      if (!variant.attributes) return;

      const colorAttr = variant.attributes.find(
        (attr) => COLOR_NAMES.includes(attr.attribute_type?.name)
      );
      
      const ramAttr = variant.attributes.find(
        (attr) => RAM_NAMES.includes(attr.attribute_type?.name)
      );

      if (colorAttr && ramAttr) {
        const colorDisplayName = getColorDisplayName(colorAttr);
        
        if (colorDisplayName === colorName && ramAttr.value && ramAttr.value !== "-") {
          ramOptions.add(ramAttr.value);
        }
      }
    });

    return Array.from(ramOptions);
  };

  // ✅ Get Hard Disk options for selected color and RAM
  const getAvailableHardDiskForColorAndRam = (
    colorName: string,
    ramValue: string,
  ): string[] => {
    if (!product.variants || product.variants.length === 0) {
      return [];
    }

    const hardDiskOptions = new Set<string>();

    product.variants.forEach((variant) => {
      if (!variant.attributes) return;

      const colorAttr = variant.attributes.find(
        (attr) => COLOR_NAMES.includes(attr.attribute_type?.name)
      );
      
      const ramAttr = variant.attributes.find(
        (attr) => RAM_NAMES.includes(attr.attribute_type?.name)
      );
      
      const hardDiskAttr = variant.attributes.find(
        (attr) => HARD_DISK_NAMES.includes(attr.attribute_type?.name)
      );

      if (colorAttr && ramAttr && hardDiskAttr) {
        const colorDisplayName = getColorDisplayName(colorAttr);
        
        if (
          colorDisplayName === colorName &&
          ramAttr.value === ramValue &&
          hardDiskAttr.value &&
          hardDiskAttr.value !== "-"
        ) {
          hardDiskOptions.add(hardDiskAttr.value);
        }
      }
    });

    return Array.from(hardDiskOptions);
  };

  // ✅ Get matching variant
  const getSelectedVariant = (
    colorName: string,
    ramValue: string,
    hardDiskValue: string,
  ): ProductVariant | null => {
    if (!product.variants || product.variants.length === 0) return null;

    const variant = product.variants.find((variant) => {
      if (!variant.attributes) return false;

      const colorAttr = variant.attributes.find(
        (attr) => COLOR_NAMES.includes(attr.attribute_type?.name)
      );
      
      const ramAttr = variant.attributes.find(
        (attr) => RAM_NAMES.includes(attr.attribute_type?.name)
      );
      
      const hardDiskAttr = variant.attributes.find(
        (attr) => HARD_DISK_NAMES.includes(attr.attribute_type?.name)
      );

      if (colorAttr && ramAttr && hardDiskAttr) {
        const colorDisplayName = getColorDisplayName(colorAttr);
        
        return (
          colorDisplayName === colorName &&
          ramAttr.value === ramValue &&
          hardDiskAttr.value === hardDiskValue
        );
      }
      
      return false;
    });

    return variant || null;
  };

  // ✅ Get all available images
  const getAllImages = (): string[] => {
    const images: string[] = [];

    if (selectedVariant && selectedVariant.variant_image) {
      images.push(selectedVariant.variant_image);
    }

    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }

    return [...new Map(images.map((img) => [img, img])).values()];
  };

  // ✅ Get main image
  const getMainImage = (): string => {
    const allImagesList = getAllImages();

    if (allImagesList.length > 0 && selectedImage < allImagesList.length) {
      return allImagesList[selectedImage];
    }

    return "/images/placeholder.jpg";
  };

  const availableColors = product.has_variants
    ? getAvailableColorsFromVariants()
    : [];
  const availableRam = selectedColor
    ? getAvailableRamForColor(selectedColor)
    : [];
  const availableHardDisk =
    selectedColor && selectedRam
      ? getAvailableHardDiskForColorAndRam(selectedColor, selectedRam)
      : [];

  // ✅ Set first available color
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].name);
    }
  }, [availableColors.length]);

  // ✅ Reset RAM and Hard Disk on color change
  useEffect(() => {
    if (selectedColor) {
      const ramOptions = getAvailableRamForColor(selectedColor);
      if (ramOptions.length > 0) {
        setSelectedRam(ramOptions[0]);
      } else {
        setSelectedRam("");
      }
      setSelectedHardDisk("");
    }
  }, [selectedColor]);

  // ✅ Reset Hard Disk on RAM change
  useEffect(() => {
    if (selectedColor && selectedRam) {
      const hardDiskOptions = getAvailableHardDiskForColorAndRam(
        selectedColor,
        selectedRam,
      );
      if (hardDiskOptions.length > 0) {
        setSelectedHardDisk(hardDiskOptions[0]);
      } else {
        setSelectedHardDisk("");
      }
    }
  }, [selectedRam]);

  // ✅ Update variant and reset quantity
  useEffect(() => {
    if (selectedColor && selectedRam && selectedHardDisk) {
      const variant = getSelectedVariant(
        selectedColor,
        selectedRam,
        selectedHardDisk,
      );
      setSelectedVariant(variant);
      setSelectedImage(0);
      // ✅ إعادة تعيين الكمية إلى 1 عند تغيير المتغير
      setQuantity(1);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedRam, selectedHardDisk]);

  // ✅ Current price
  const currentPrice = selectedVariant
    ? selectedVariant.price_after_discount || selectedVariant.price
    : product.price;

  const originalPrice = selectedVariant?.has_discount
    ? selectedVariant.price
    : product.originalPrice;

  const isProductFavorite = isFavorite(product.id.toString());
  const itemInCartQuantity = getItemQuantity(product.id);

  // ✅ الحصول على رمز العملة
  const getCurrencySymbol = (): string => {
    return product.currency?.symbol || "ج.م";
  };

  // ✅ التحقق من توفر المنتج
  const availableQty = getAvailableQuantity();
  const maxQty = getMaxQuantity();
  const isAvailable = isProductAvailable();

  // ✅ Add to cart مع التحقق من الكمية
  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    // ✅ التحقق من توفر المنتج
    if (!isAvailable) {
      toast.error(t.outOfStock, {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    if (product.has_variants && !selectedVariant) {
      toast.error(t.pleaseSelect, {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    // ✅ التحقق من أن الكمية المطلوبة لا تتجاوز المتاحة
    if (quantity > maxQty) {
      toast.error(t.notEnoughStock.replace('{max}', maxQty.toString()), {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      const variantId = selectedVariant?.id || null;
      const success = await addItem(product.id, quantity, variantId);

      if (success) {
        setQuantity(1);
        toast.success(t.addToCart, {
          duration: 3000,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      toast.error(t.errorAdding, {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(t.loginFirst, {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    await toggleFavorite(product.id.toString(), isProductFavorite);
  };

  // ✅ تحديث دالة زيادة الكمية
  const increaseQuantity = () => {
    if (quantity < maxQty) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.error(t.maxQuantity.replace('{max}', maxQty.toString()), {
        duration: 2000,
        position: "top-center",
      });
    }
  };

  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://admin.souqkaber.com${url}`;
    }
    return url;
  };

  const discountAmount = originalPrice ? originalPrice - currentPrice : 0;
  const discountPercentage = originalPrice
    ? Math.round((discountAmount / originalPrice) * 100)
    : 0;

  const allImages = getAllImages();
  const mainImage = getMainImage();

  // ✅ استخراج رابط الفيديو للتضمين
  const embedVideoUrl = product.video ? getEmbedVideoUrl(product.video) : null;

  if (authLoading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-[8px] mb-3"></div>
          <div className="h-7 bg-gray-200 rounded-[8px] w-1/3 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded-[8px] w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      {/* Breadcrumb */}
      <div className="flex gap-1 mb-2 text-base">
        <Link href="/" className="text-[#726C6C]">
          {t.home}
        </Link>
        <span className="text-[#333333] font-bold">/</span>
        <Link href="/products" className="text-[#726C6C] font-bold">
          {product.brand || t.products}
        </Link>
        <span className="text-[#180100] font-bold">/</span>
        <p className="text-[#180100] font-bold truncate max-w-[150px]">
          {product.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-10">
        {/* ===== Images Section ===== */}
        <div className="space-y-1.5 col-span-2">
          <div className="relative h-[200px] md:h-[400px] lg:h-[500px] bg-[#00000033] rounded-[8px] overflow-hidden">
            {/* ✅ إذا كان الفيديو ظاهر، اعرض الفيديو */}
            {showVideo && embedVideoUrl ? (
              <>
                <iframe
                  ref={videoRef}
                  src={embedVideoUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={t.productVideo.replace('{name}', product.name)}
                />
                <button
                  onClick={hideVideoPlayer}
                  className="absolute top-3 start-3 z-20 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all duration-200 border border-white/20 hover:border-white/40"
                  aria-label={t.closeVideo}
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${cleanImageUrl(mainImage)})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                  }}
                />
                
                <div 
                  className="absolute inset-0 w-full h-full z-10"
                  style={{
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 100%)",
                  }}
                />

                {discountPercentage > 0 && (
                  <span className="absolute top-2 start-2 bg-[#23A6F0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                    {discountPercentage}% {t.discount}
                  </span>
                )}

                {/* ✅ عرض علامة " نفذ من المخزون" إذا كانت الكمية صفر */}
                {/* {!isAvailable && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-t-lg">
                    <p className="text-white text-lg font-bold bg-red-600 px-4 py-2 rounded-lg">
                      {t.outOfStock}
                    </p>
                  </div>
                )} */}

                {product.video && embedVideoUrl && isAvailable && (
                  <button
                    onClick={showVideoPlayer}
                    className="absolute inset-0 z-10 flex items-center justify-center group"
                    aria-label={t.playVideo}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white shadow-lg">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-[#0A0500] fill-[#0A0500] ml-1" />
                    </div>
                  </button>
                )}
              </>
            )}
          </div>

          {/* ✅ الصور المصغرة - تختفي عند عرض الفيديو */}
          {allImages.length > 1 && !showVideo && (
            <div className="flex gap-1.5">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`
                    relative aspect-[4/3] max-h-[80px] bg-gray-100 rounded-[8px] overflow-hidden
                    border-2 transition-all duration-200
                    ${selectedImage === index ? "border-[#23A6F0]" : "border-transparent hover:border-gray-300"}
                  `}
                >
                  <Image
                    src={cleanImageUrl(image)}
                    alt={`${product.name} - ${language === 'ar' ? 'صورة' : 'image'} ${index + 1}`}
                    width={2000}
                    height={2000}
                    className="object-cover"
                    sizes="(max-width: 768px) 30vw, 15vw"
                  />
                </button>
              ))}
            </div>
          )}

          {/* ✅ رسالة بدل الصور المصغرة عند عرض الفيديو */}
          {showVideo && (
            <div className="text-center text-sm text-gray-500 py-2">
              <button
                onClick={hideVideoPlayer}
                className="text-[#23A6F0] hover:underline font-medium"
              >
                {t.backToImages}
              </button>
            </div>
          )}
        </div>

        {/* ===== Product Info ===== */}
        <div className="space-y-2 lg:space-y-5 lg:col-span-3">
          {/* Title & Price */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h1 className="text-lg lg:text-xl font-bold text-[#000000] leading-tight">
                {product.name}
              </h1>
              <span className="text-sm lg:text-base text-[#666666]">
                {product.brand || t.noBrand}
              </span>
            </div>
         
            <div className="flex flex-col items-end">
                 {currentPrice>0 &&(<span className="text-lg lg:text-xl font-bold text-[#23A6F0] flex items-center gap-0.5">
                {currentPrice.toLocaleString()}
                <span className="text-sm">{getCurrencySymbol()}</span>
              </span>)}
              {originalPrice && originalPrice !== currentPrice && (
                <span className="text-xs lg:text-base text-[#00000080] line-through flex items-center gap-0.5">
                  {originalPrice.toLocaleString()}
                  <span className="text-[10px]">{getCurrencySymbol()}</span>
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 lg:mt-4">
            <div className="flex items-center bg-[#EDF0F8] text-[#3A4980] font-bold text-xs rounded-full px-2 py-0.5 gap-1">
              <IoChatboxEllipsesOutline className="w-3 h-3" />
              <span>{product.reviewsCount}</span>
              <span>{t.review}</span>
            </div>
            {product.avg_rating > 0 && (
              <div className="flex items-center bg-[#FFF5F4] text-[#FA6054] font-bold text-xs rounded-full px-2 py-0.5 gap-1">
                <FaRegStar className="w-2.5 h-2.5" />
                <span>{product.avg_rating}</span>
              </div>
            )}
          </div>

          {/* ===== Color Selection ===== */}
          {product.has_variants && availableColors.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center lg:mt-4">
                  <span className="text-sm font-bold text-[#333333]">
                    {t.color}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`
                        group relative w-8 h-8 rounded-full border border-gray-400 shadow-md transition-all duration-200
                        ${selectedColor === color.name ? "ring-2 ring-offset-1 scale-105" : "hover:scale-105"}
                      `}
                      style={{ backgroundColor: color.code }}
                      aria-label={`${t.color} ${color.name}`}
                    >
                      {selectedColor === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <hr className="my-2" />
            </>
          )}

          {/* ===== RAM Selection ===== */}
          {product.has_variants && availableRam.length > 0 && (
            <div>
              <div className="flex justify-between items-center lg:mt-4">
                <span className="text-sm font-bold text-[#333333] flex items-center gap-1.5">
                  <MemoryStick className="w-3.5 h-3.5" />
                  {t.ram}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {availableRam.map((ram) => (
                  <button
                    key={ram}
                    onClick={() => setSelectedRam(ram)}
                    className={`
                      flex items-center justify-center rounded-[8px] px-2.5 py-1 text-xs font-medium transition-all duration-200
                      ${
                        selectedRam === ram
                          ? "bg-[#EDF0F8] text-[#3A4980] border border-[#3A4980]"
                          : "bg-[#F3F3F3] text-[#726C6C] hover:bg-[#EDF0F8]"
                      }
                    `}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== Hard Disk Selection ===== */}
          {product.has_variants && availableHardDisk.length > 0 && (
            <div>
              <div className="flex justify-between items-center mt-2 lg:mt-4">
                <span className="text-sm font-bold text-[#333333] flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" />
                  {t.hardDisk}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {availableHardDisk.map((hardDisk) => (
                  <button
                    key={hardDisk}
                    onClick={() => setSelectedHardDisk(hardDisk)}
                    className={`
                      flex items-center justify-center rounded-[8px] px-2.5 py-1 text-xs font-medium transition-all duration-200
                      ${
                        selectedHardDisk === hardDisk
                          ? "bg-[#EDF0F8] text-[#3A4980] border border-[#3A4980]"
                          : "bg-[#F3F3F3] text-[#726C6C] hover:bg-[#EDF0F8]"
                      }
                    `}
                  >
                    {hardDisk}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== Quantity ===== */}
          <div>
            <div className="flex items-center gap-2 lg:mt-4">
              <div className={`flex items-center rounded-full bg-[#F3F3F3] h-9 w-[110px] justify-center ${!isAvailable ? 'opacity-50' : ''}`}>
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || !isAvailable}
                  className="w-6 h-6 flex items-center justify-center text-[#A3A3A3] transition disabled:cursor-not-allowed"
                >
                  <FaMinus className="w-2.5 h-2.5" />
                </button>
                <span className="w-10 text-center text-base font-bold text-[#222222]">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= maxQty || !isAvailable}
                  className="w-6 h-6 flex items-center justify-center text-[#3A4980] font-bold transition disabled:cursor-not-allowed"
                >
                  <FaPlus className="w-2.5 h-2.5 font-bold" />
                </button>
              </div>
              
              {/* ✅ عرض الكمية المتبقية */}
              {isAvailable && maxQty > 0 && maxQty < 10 && (
                <span className="text-xs text-orange-600">
                  {t.onlyLeft.replace('{count}', maxQty.toString())}
                </span>
              )}
              
              {/* ✅ عرض " نفذ من المخزون" */}
              {!isAvailable && (
                <span className="text-sm text-red-600 font-bold">
                  {t.outOfStock}
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-1.5 lg:gap-4 mt-2 lg:mt-4">
            <button
              onClick={handleAddToCart}
              disabled={
                isAddingToCart ||
                cartLoading ||
                !isAvailable ||
                (product.has_variants && !selectedVariant)
              }
              className={`flex-1 text-sm text-white px-4 py-2 rounded-[8px] font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                ${isAvailable ? 'bg-[#2DA5F3] hover:bg-[#3bacf8]' : 'bg-gray-400 cursor-not-allowed'}
              `}
            >
              {isAddingToCart ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.adding}
                </>
              ) : (
                isAvailable ? t.addToCart : t.outOfStock
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                disabled={isMutating}
                className={`
                  flex-1 py-2 rounded-[8px] text-[#1E75AB] font-bold transition-all duration-300 flex items-center justify-center gap-2 text-xs
                  ${
                    isProductFavorite
                      ? "bg-blue-50 text-red-600 border border-red-200 hover:bg-red-100"
                      : "border border-[#1E75AB] hover:bg-[#78c0ec2d]"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Heart
                  className={`h-3.5 w-3.5 ${isProductFavorite?'text-[#ef4444]':'text-[#1E75AB]'}`}
                  fill={isProductFavorite ? "#ef4444" : "none"}
                />
                {isProductFavorite ? t.favorites : t.addToFavorites}
              </button>
            </div>
          </div>

          {/* Accordion */}
          <div className="border-t border-gray-200 pt-2 space-y-1.5">
            <div>
              <button
                onClick={() =>
                  setActiveTab(activeTab === "info" ? "shipping" : "info")
                }
                className="flex justify-between items-center w-full py-1.5 text-right"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-1.5 text-sm">
                  <Info className="w-3.5 h-3.5 text-[#23A6F0]" />
                  {t.productInfo}
                </span>
                <span className="text-lg">
                  {activeTab === "info" ? "−" : "+"}
                </span>
              </button>
              {activeTab === "info" && (
                <div className="pt-0.5 pb-1 text-gray-600 text-[11px] leading-relaxed space-y-0.5">
                  <p>{product.description}</p>
                  <p>
                    <strong>{t.productCode}:</strong> {product.sku}
                  </p>
                  <p>
                    <strong>{t.category}:</strong> {product.category}
                  </p>
                  <p>
                    <strong>{t.brand}:</strong> {product.brand || t.noBrand}
                  </p>
                  {selectedVariant && (
                    <>
                      <p>
                        <strong>{t.ram}:</strong> {selectedRam}
                      </p>
                      <p>
                        <strong>{t.hardDisk}:</strong> {selectedHardDisk}
                      </p>
                    </>
                  )}
                  {/* ✅ عرض الكمية المتاحة */}
                  <p>
                    <strong>{t.availableQuantity}:</strong> {isAvailable ? maxQty : 0}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}