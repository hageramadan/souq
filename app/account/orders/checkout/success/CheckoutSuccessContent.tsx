// app/account/orders/checkout/success/CheckoutSuccessContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getHeaders } from "@/services/api";

const API_URL = 'https://dukanah.admin.t-carts.com/api';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};



export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const handleSuccess = async () => {
      const orderNum = searchParams.get('order_number');
      
      if (!orderNum) {
        setError('رقم الطلب غير موجود');
        setLoading(false);
        return;
      }

      setOrderNumber(orderNum);

      try {
        // ✅ محاولة 1: جلب الطلب بواسطة رقم الطلب (إذا كان الـ API يدعم)
        let foundOrder = null;
        
        try {
          const response = await fetch(`${API_URL}/orders/by-number/${orderNum}`, {
            method: 'GET',
            headers: getHeaders(),
          });

          if (response.ok) {
            const data = await response.json();
            // ✅ التحقق من هيكل البيانات
            if (data.result === true && data.data) {
              // إذا كان data.data.order موجود
              if (data.data.order) {
                foundOrder = data.data.order;
              } 
              // إذا كان data.data هو الطلب نفسه
              else if (data.data.id) {
                foundOrder = data.data;
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Endpoint /orders/by-number not found, trying alternative...');
        }

        // ✅ محاولة 2: جلب الطلب باستخدام الـ API الرئيسي للطلبات
        if (!foundOrder) {
          try {
            const response = await fetch(`${API_URL}/orders`, {
              method: 'GET',
              headers: getHeaders(),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.result === true && data.data) {
                // ✅ التحقق من هيكل البيانات
                let orders = [];
                
                // إذا كان data.data مصفوفة
                if (Array.isArray(data.data)) {
                  orders = data.data;
                } 
                // إذا كان data.data.data مصفوفة (تقسيم الصفحات)
                else if (Array.isArray(data.data.data)) {
                  orders = data.data.data;
                }
                // إذا كان data.data.orders مصفوفة
                else if (Array.isArray(data.data.orders)) {
                  orders = data.data.orders;
                }
                // إذا كان data.data.order كائن واحد
                else if (data.data.order) {
                  orders = [data.data.order];
                }

                // البحث عن الطلب
                if (orders.length > 0) {
                  foundOrder = orders.find((order: any) => order.order_number === orderNum);
                }
              }
            }
          } catch (error) {
            console.error('❌ Error fetching orders list:', error);
          }
        }

        // ✅ إذا تم العثور على الطلب
        if (foundOrder) {
          setOrderId(foundOrder.id);
          
          toast.success('🎉 تم الدفع بنجاح!', {
            duration: 3000,
            position: 'top-center',
          });

          setTimeout(() => {
            router.push(`/account/orders/${foundOrder.id}`);
          }, 2000);
        } else {
          // ✅ إذا لم نجد الطلب، نذهب إلى قائمة الطلبات
          toast.success('🎉 تم الدفع بنجاح! جاري التوجيه إلى طلباتك', {
            duration: 3000,
            position: 'top-center',
          });
          
          setTimeout(() => {
            router.push('/account/orders');
          }, 2000);
        }
      } catch (error) {
        console.error('❌ Error processing payment:', error);
        setError('حدث خطأ في معالجة الدفع');
        setLoading(false);
      }
    };

    handleSuccess();
  }, [searchParams, router]);

  // ✅ عرض رسالة نجاح مع التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#EC221F] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">جاري تأكيد الدفع...</h2>
          <p className="text-gray-500">يرجى الانتظار لحظة</p>
          {orderNumber && (
            <p className="text-gray-400 text-sm mt-4">
              رقم الطلب: <span className="font-medium">{orderNumber}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // ✅ حالة النجاح (عندما يتم العثور على الطلب)
  if (orderId && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ تم الدفع بنجاح!</h2>
          <p className="text-gray-500 mb-2">
            رقم الطلب: <span className="font-bold text-[#EC221F]">{orderNumber}</span>
          </p>
          <p className="text-gray-400 text-sm mb-6">جاري تحويلك إلى صفحة تفاصيل الطلب...</p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ أو عدم العثور على الطلب
  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {error || 'تم الدفع ولكن لم نتمكن من العثور على الطلب'}
        </h2>
        {orderNumber && (
          <p className="text-gray-500 mb-2">
            رقم الطلب: <span className="font-medium">{orderNumber}</span>
          </p>
        )}
        <p className="text-gray-400 text-sm mb-6">
          سيتم توجيهك إلى قائمة طلباتك
        </p>
        <button
          onClick={() => router.push('/account/orders')}
          className="bg-[#EC221F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          عرض طلباتي
        </button>
      </div>
    </div>
  );
}