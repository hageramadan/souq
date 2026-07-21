// app/account/orders/checkout/failed/CheckoutFailedContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, AlertCircle, CreditCard, ArrowRight, Home } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const orderNum = searchParams.get('order_number');
    const reasonParam = searchParams.get('reason');
    
    setOrderNumber(orderNum);
    setReason(reasonParam);

    console.log('❌ Payment failed:', {
      orderNumber: orderNum,
      reason: reasonParam,
    });

    if (reasonParam === 'payment_declined') {
      toast.error(' تم رفض عملية الدفع', {
        duration: 4000,
        position: 'top-center',
      });
    } else {
      toast.error(' فشلت عملية الدفع', {
        duration: 4000,
        position: 'top-center',
      });
    }
  }, [searchParams]);

  const getErrorMessage = (reason: string | null): string => {
    const messages: Record<string, string> = {
      'payment_declined': 'تم رفض الدفع من قبل البنك أو جهة الإصدار',
      'insufficient_funds': 'الرصيد غير كافٍ لإتمام العملية',
      'card_expired': 'البطاقة منتهية الصلاحية',
      'invalid_card': 'بيانات البطاقة غير صحيحة',
      'technical_error': 'حدث خطأ تقني أثناء معالجة الدفع',
      'timeout': 'انتهت مهلة الدفع، يرجى المحاولة مرة أخرى',
      'cancelled_by_user': 'تم إلغاء الدفع من قبلك',
      'fraud_suspected': 'تم رفض العملية للاشتباه في احتيال',
      'authentication_failed': 'فشل التحقق من الهوية',
    };

    if (reason && messages[reason]) {
      return messages[reason];
    }
    return 'حدثت مشكلة أثناء معالجة الدفع. يرجى المحاولة مرة أخرى أو استخدام طريقة دفع أخرى.';
  };

  const getIcon = (reason: string | null) => {
    if (reason === 'cancelled_by_user') {
      return <AlertCircle className="w-14 h-14 text-yellow-500" />;
    }
    if (reason === 'insufficient_funds') {
      return <CreditCard className="w-14 h-14 text-red-500" />;
    }
    return <XCircle className="w-14 h-14 text-red-500" />;
  };

  const getBgColor = (reason: string | null) => {
    if (reason === 'cancelled_by_user') {
      return 'bg-yellow-100';
    }
    return 'bg-red-100';
  };

  const getSuggestions = (reason: string | null): string[] => {
    const suggestions: Record<string, string[]> = {
      'payment_declined': [
        'تأكد من صحة بيانات البطاقة',
        'جرب استخدام بطاقة أخرى',
        'تواصل مع البنك للتأكد من تفعيل الدفع الإلكتروني'
      ],
      'insufficient_funds': [
        'تأكد من وجود رصيد كافٍ في الحساب',
        'جرب استخدام بطاقة أخرى',
        'تواصل مع البنك لمعرفة الحدود اليومية'
      ],
      'card_expired': [
        'استخدم بطاقة أخرى غير منتهية الصلاحية',
        'تواصل مع البنك لتجديد البطاقة'
      ],
      'invalid_card': [
        'تأكد من إدخال رقم البطاقة وتاريخ الانتهاء ورمز CVV بشكل صحيح',
        'جرب استخدام بطاقة أخرى'
      ],
      'timeout': [
        'حاول مرة أخرى مع التأكد من استقرار الاتصال بالإنترنت',
        'تأكد من إتمام عملية الدفع خلال الوقت المحدد'
      ],
      'cancelled_by_user': [
        'يمكنك المحاولة مرة أخرى في أي وقت',
        'تأكد من رغبتك في إتمام الشراء قبل البدء'
      ],
    };

    if (reason && suggestions[reason]) {
      return suggestions[reason];
    }
    return [
      'حاول مرة أخرى باستخدام طريقة دفع مختلفة',
      'تأكد من صحة بيانات الدفع',
      'تواصل مع خدمة العملاء للمساعدة'
    ];
  };

  const suggestions = getSuggestions(reason);

  // ✅ دالة إعادة المحاولة
  const handleRetry = () => {
    // الخيار 1: العودة إلى الصفحة السابقة (صفحة الدفع)
    router.back();
    
    // أو الخيار 2: التوجيه إلى صفحة الدفع إذا كان المسار معروفاً
    // router.push(`/checkout?order_number=${orderNumber}`);
    
    // أو الخيار 3: التوجيه إلى صفحة الطلب مع إعادة المحاولة
    // router.push(`/account/orders/${orderNumber}?retry=true`);
  };

  // ✅ دالة عرض الطلب
  const handleViewOrder = () => {
    if (orderNumber) {
      // محاولة البحث عن الطلب وتوجيه المستخدم إليه
      router.push(`/account/orders?order=${orderNumber}`);
    } else {
      router.push('/account/orders');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* الأيقونة */}
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-24 ${getBgColor(reason)} rounded-full flex items-center justify-center`}>
            {getIcon(reason)}
          </div>
        </div>

        {/* العنوان */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {reason === 'cancelled_by_user' ? 'تم إلغاء الدفع' : 'فشلت عملية الدفع'}
        </h1>

        {/* رقم الطلب */}
        {orderNumber && (
          <p className="text-center text-gray-500 mb-2">
            رقم الطلب: <span className="font-bold text-[#EC221F]">{orderNumber}</span>
          </p>
        )}

        {/* رسالة الخطأ */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm text-center">
            {getErrorMessage(reason)}
          </p>
        </div>

        {/* الاقتراحات */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            حلول مقترحة:
          </h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-[#EC221F] font-bold text-lg leading-none mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* الأزرار */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRetry}
            className="w-full bg-[#EC221F] text-white py-3 rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            محاولة الدفع مرة أخرى
          </button>

          <button
            onClick={handleViewOrder}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            عرض طلباتي
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            العودة إلى الرئيسية
          </button>
        </div>

        {/* معلومات إضافية للمساعدة */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-400">
            إذا استمرت المشكلة، يرجى التواصل مع خدمة العملاء على{' '}
            <a href="mailto:support@dukanah.com" className="text-[#EC221F] hover:underline">
              support@dukanah.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}