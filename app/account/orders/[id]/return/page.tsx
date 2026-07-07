// app/account/orders/[id]/return/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Package, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IoCopyOutline } from "react-icons/io5";
import toast from "react-hot-toast";

// ========== إعدادات API ==========
const API_URL = 'https://admin.souqkaber.com/api';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// ========== أنواع البيانات ==========
interface OrderItem {
  id: number;
  title: string;
  name?: string;
  brand?: string;
  color?: string;
  size?: string;
  quantity: number;
  unit_price: number;
  price?: number;
  total_price: number;
  originalPrice?: number;
  images: string[];
  image?: string;
  variant?: {
    id: number;
    sku: string | null;
    price: number;
    has_discount: boolean;
    discount_type: string | null;
    discount_value: string | null;
    price_after_discount: number;
    quantity: number;
    is_active: boolean;
    variant_image: string;
    attributes: Array<{
      id: number;
      attribute_type: {
        id: number;
        name: string;
      };
      value: string;
      meta: {
        color?: string;
      } | null;
    }>;
  };
}

interface OrderDetails {
  id: number;
  order_number: string;
  orderNumber?: string;
  date: string;
  created_at?: string;
  status: string;
  status_label?: string;
  total_amount: number;
  items: OrderItem[];
}

// ========== خيارات طريقة استرداد المبلغ ==========
const refundMethods = [
  { 
    id: "wallet", 
    name: "المحفظة الإلكترونية", 
    description: "سيتم إضافة المبلغ إلى محفظتك"
  },
];

// ========== دوال استخراج الخصائص ==========

// جلب الذاكرة (RAM)
const getMemory = (item: OrderItem): string | null => {
  if (!item.variant?.attributes) return null;
  const memoryAttr = item.variant.attributes.find(
    (attr) => attr.attribute_type.name === "الذاكرة"
  );
  return memoryAttr?.value || null;
};

// جلب الهارد ديسك (Storage)
const getStorage = (item: OrderItem): string | null => {
  if (!item.variant?.attributes) return null;
  const storageAttr = item.variant.attributes.find(
    (attr) => attr.attribute_type.name === "هارد ديسك"
  );
  return storageAttr?.value || null;
};

// جلب اللون
const getColor = (item: OrderItem): { name: string; hex: string | null } | null => {
  if (!item.variant?.attributes) return null;
  const colorAttr = item.variant.attributes.find(
    (attr) => attr.attribute_type.name === "اللون" || attr.attribute_type.name === "لون"
  );
  if (!colorAttr) return null;
  
  return {
    name: colorAttr.value,
    hex: colorAttr.meta?.color || null,
  };
};

// ========== دالة جلب تفاصيل الطلب ==========
const fetchOrderDetails = async (orderId: string): Promise<OrderDetails | null> => {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
   
    
    if (data.result === true && data.data) {
      const order = data.data;
      return {
        id: order.id,
        order_number: order.order_number,
        orderNumber: order.order_number,
        date: new Date(order.created_at).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        created_at: order.created_at,
        status: order.status_label,
        total_amount: order.total_amount,
        items: (order.items || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          name: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          price: item.unit_price,
          total_price: item.total_price,
          images: item.images || [],
          image: item.images && item.images[0] ? cleanImageUrl(item.images[0]) : "/images/placeholder-product.png",
          variant: item.variant || null,
        })),
      };
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching order details:", error);
    toast.error("حدث خطأ في جلب تفاصيل الطلب");
    return null;
  }
};

// ========== دالة تقديم طلب إرجاع ==========
const submitReturnRequest = async (
  orderId: number,
  refundMethod: string,
  notes: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const response = await fetch(`${API_URL}/returns`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        order_id: orderId,
        refund_method: refundMethod,
        notes: notes || null,
      }),
    });
    
    const data = await response.json();
   
    
    if (data.result === true && data.errNum === 200) {
      return { 
        success: true, 
        message: data.message || "تم تقديم طلب الإرجاع بنجاح",
        data: data.data
      };
    } else {
      return { 
        success: false, 
        message: data.message || "حدث خطأ أثناء تقديم طلب الإرجاع" 
      };
    }
  } catch (error) {
    console.error("❌ Error submitting return request:", error);
    return { 
      success: false, 
      message: "حدث خطأ في الاتصال بالخادم" 
    };
  }
};

// ========== تنظيف رابط الصورة ==========
const cleanImageUrl = (url: string): string => {
  if (!url) return "/images/placeholder-product.png";
  if (url.startsWith("/storage")) {
    return `https://admin.souqkaber.com${url}`;
  }
  return url;
};

// ========== تنسيق التاريخ ==========
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ReturnRequestPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // جلب تفاصيل الطلب عند تحميل الصفحة
  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      const orderData = await fetchOrderDetails(orderId);
      setOrder(orderData);
      setLoading(false);
    };
    
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // دالة تقديم طلب الإرجاع
  const handleSubmit = async () => {
    // التحقق من اختيار طريقة استرداد المبلغ
    if (!refundMethod) {
      toast.error("الرجاء اختيار طريقة استرداد المبلغ", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    if (!order) return;

    setIsSubmitting(true);
    
    const result = await submitReturnRequest(order.id, refundMethod, notes);
    
    if (result.success) {
      setShowSuccess(true);
      
      // عرض رسالة نجاح إضافية
      toast.success(result.message, {
        duration: 4000,
        position: "top-center",
        icon: "✅",
      });
    } else {
      toast.error(result.message, {
        duration: 4000,
        position: "top-center",
      });
    }
    
    setIsSubmitting(false);
  };

  // إغلاق رسالة النجاح والعودة للطلبات
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    router.push("/account/orders");
  };

  // نسخ رقم الطلب
  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number);
      toast.success("تم نسخ رقم الطلب", {
        duration: 2000,
        position: "top-center",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23A6F0] mx-auto"></div>
          <p className="text-gray-500 mt-4">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 py-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            الطلب غير موجود
          </h2>
          <p className="text-gray-500 mb-4">عذراً، لا يمكننا العثور على هذا الطلب</p>
          <Link
            href="/account/orders"
            className="inline-block bg-[#23A6F0] text-white px-6 py-2 rounded-lg"
          >
            العودة إلى الطلبات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto mb-3 px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/account" className="hover:text-[#23A6F0] transition">حسابي</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/account/orders" className="hover:text-[#23A6F0] transition">طلباتي</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#23A6F0] font-medium">طلب إرجاع</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-right">
            طلب إرجاع
          </h1>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* رقم الطلب والتاريخ */}
            <div>
              <div className="flex items-center gap-3 text-xl text-[#180100] font-bold">
                <p>رقم الطلب</p>
                <div className="flex items-center gap-1">
                  <p>{order.order_number}</p>
                  <IoCopyOutline 
                    className="cursor-pointer hover:text-[#23A6F0] transition"
                    onClick={copyOrderNumber}
                  />
                </div>
              </div>
              <div>
                <p className="text-[#333333] text-lg my-3">{order.date}</p>
              </div>
            </div>

            {/* المنتجات مع عرض اللون والذاكرة والهارد ديسك */}
            <div>
              <p className="text-gray-600 mb-3">
                المنتجات ({order.items.length})
              </p>
              {order.items.map((item, idx) => {
                const productImage = item.image || (item.images && item.images[0] ? cleanImageUrl(item.images[0]) : "/images/placeholder-product.png");
                
                // ✅ استخراج الخصائص من الـ variant
                const memory = getMemory(item);
                const storage = getStorage(item);
                const color = getColor(item);
                
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 border border-gray-200 rounded-xl p-3 mb-3"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={productImage}
                        alt={item.title || item.name || "منتج"}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/placeholder-product.png";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-800">{item.title || item.name}</p>
                          
                          {/* ✅ عرض الخصائص (اللون، الذاكرة، الهارد ديسك) */}
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {/* عرض الذاكرة (RAM) */}
                            {memory && (
                              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                <span className="font-medium">الذاكرة:</span>
                                <span>{memory}</span>
                              </span>
                            )}
                            
                            {/* عرض الهارد ديسك */}
                            {storage && (
                              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                <span className="font-medium">هارد ديسك:</span>
                                <span>{storage}</span>
                              </span>
                            )}
                            
                            {/* عرض اللون */}
                            {color && (
                              <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                <span className="font-medium">اللون:</span>
                                <span>{color.name}</span>
                                {color.hex && (
                                  <span 
                                    className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                )}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 mt-1">
                            الكمية: x{item.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 md:text-base text-xs flex gap-1">
                            {(item.unit_price || item.price || 0).toFixed(2)} EGP
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ملاحظات */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-6 space-y-6 my-4">
            <label className="block text-[#252525] text-lg md:text-2xl font-bold mb-2">
              ملاحظات
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="قم بإدخال ملاحظاتك الإضافية.."
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#23A6F0] resize-none"
              rows={3}
            />
          </div>

          {/* طريقة استرداد المبلغ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-6 space-y-6 my-4">
            <label className="block text-[#252525] text-lg md:text-2xl font-bold mb-2 lg:mb-4">
              طريقة استرداد المبلغ
            </label>
            <div className="space-y-3">
              {refundMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                    refundMethod === method.id
                      ? "border-[#23A6F0] bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="refundMethod"
                    value={method.id}
                    checked={refundMethod === method.id}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="mt-1 w-4 h-4 text-[#23A6F0] focus:ring-[#23A6F0]"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{method.name}</p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* زر تأكيد الطلب */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !refundMethod}
            className={`w-full py-3 rounded-xl font-medium transition mt-4 ${
              isSubmitting || !refundMethod
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#000000] text-white hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري تقديم الطلب...
              </div>
            ) : (
              "تأكيد طلب الإرجاع"
            )}
          </button>
        </div>
      </div>

      {/* نافذة النجاح */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">تم تقديم طلب الإرجاع بنجاح</h3>
            <p className="text-gray-500 mb-6">
              رقم الطلب: <span className="font-bold text-[#23A6F0]">{order.order_number}</span>
              <br />
              سيتم معالجة طلبك والتواصل معك قريباً
            </p>
            <button
              onClick={handleCloseSuccess}
              className="w-full bg-[#000000] text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              العودة إلى الطلبات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}