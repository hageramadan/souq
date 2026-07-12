"use client";

import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WalletPage() {
  const { t } = useTranslation();
  
  const {language} = useLanguage()
  // حالات البيانات
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const [isClient, setIsClient] = useState(false);
  // ✅ دالة مساعدة لاستخراج الرصيد والعملة من البيانات
    useEffect(() => {
    setIsClient(true);
  }, []);
  const parseBalance = (value: any): { currency: string; amount: number } => {
    // الحالة 1: قيمة نصية مثل "EGP 100.50"
    if (typeof value === 'string') {
      const parts = value.trim().split(/\s+/);
      if (parts.length === 2) {
        const currency = parts[0];
        const amount = parseFloat(parts[1]);
        if (!isNaN(amount)) {
          return { currency, amount };
        }
      }
      // محاولة استخراج الأرقام فقط إذا كانت العملة غير موجودة
      const numericMatch = value.match(/[\d.]+/);
      if (numericMatch) {
        return { currency: "", amount: parseFloat(numericMatch[0]) };
      }
      return { currency: "", amount: 0 };
    }
    
    // الحالة 2: قيمة رقمية
    if (typeof value === 'number') {
      return { currency: "", amount: value };
    }
    
    // الحالة 3: كائن يحتوي على balance و currency
    if (value && typeof value === 'object') {
      const currency = value.currency || "";
      const amount = parseFloat(value.balance || value.amount || 0);
      return { currency, amount: isNaN(amount) ? 0 : amount };
    }
    
    // الحالة الافتراضية
    return { currency: "", amount: 0 };
  };

  // دالة لجلب الرصيد من الـ API
  const fetchWalletBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error(t('wallet.tokenNotFound'));
      }

      const apiUrl = "https://admin.souqkaber.com/api";
      const response = await fetch(`${apiUrl}/wallet`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          'content-type': "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.result === true && data.errNum === 200) {
        // ✅ استخدام الدالة المساعدة لتحليل البيانات بأمان
        const balanceData = data.data.balance;
        
        // طباعة في الكونسول للتحقق من شكل البيانات (يمكنك إزالة هذا السطر)
        console.log("Balance data type:", typeof balanceData);
        console.log("Balance data:", balanceData);
        
        const parsed = parseBalance(balanceData);
        setCurrency(parsed.currency);
        setBalance(parsed.amount);
      } else {
        throw new Error(data.message || t('wallet.fetchError'));
      }
    } catch (err: any) {
      console.error("Error fetching wallet balance:", err);
      setError(err.message || t('wallet.serverError'));
    } finally {
      setLoading(false);
    }
  };

  // جلب الرصيد عند تحميل الصفحة
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff3c27] mx-auto mb-4"></div>
          {/* <p className="text-gray-600">{t('wallet.loading')}</p> */}
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto pb-4">
          <div className="mb-6">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[#ff3c27] transition mb-4"
            >
              <FaChevronRight className={`h-4 w-4 ${isClient && language === 'en' ? 'rotate-180' : ''}`} />
              <span>{t('wallet.backToAccount')}</span>
            </Link>
          </div>
          <div className="bg-blue-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchWalletBalance}
              className="px-4 py-2 bg-[#ff3c27] text-white rounded-[8px] hover:bg-[#e63520] transition"
            >
              {t('wallet.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // عرض الصفحة مع الرصيد الحقيقي
  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto pb-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#ff3c27] transition mb-4"
          >
            <FaChevronRight className={`h-4 w-4 ${isClient && language === 'en' ? 'rotate-180' : ''}`} />
            <span>{t('wallet.backToAccount')}</span>
          </Link>
          <h1 className="text-xl font-bold text-[#180100]">{t('wallet.title')}</h1>
        </div>

        {/* بطاقة الرصيد - Wallet Card */}
        <div className="space-y-3 mb-6">
          <div className="relative overflow-hidden bg-card-wallet rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 w-fit">
                  <Image
                    src="/images/wallet.png"
                    alt={t('wallet.wallet')}
                    width={28}
                    height={28}
                    className="brightness-0 invert opacity-90"
                  />
                </div>
                <p className="text-white text-lg md:text-xl font-medium">
                  {t('wallet.wallet')}
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="text-white text-xl font-medium">
                  {t('wallet.currentBalance')}
                </span>

                {/* المبلغ - يعرض الرصيد من الـ API */}
                <div className="mb-6">
                  <span className="text-white text-xl md:text-xl font-black tracking-tight">
                    {currency} {balance !== null ? balance.toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}