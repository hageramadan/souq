"use client";

import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function WalletPage() {
  // حالات البيانات
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("EGP");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // دالة لجلب الرصيد من الـ API
  const fetchWalletBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. استرجاع التوكن من localStorage (أو من أي مكان آخر تخزنه فيه)
      const token = localStorage.getItem("auth_token"); // غير "authToken" إلى الاسم الذي تستخدمه

      if (!token) {
        throw new Error("لم يتم العثور على توكن المصادقة. الرجاء تسجيل الدخول مرة أخرى.");
      }

      // 2. عنوان الـ API - استبدل YOUR_API_URL بالعنوان الحقيقي
      const apiUrl ="https://admin.souqkaber.com/api";
      const response = await fetch(`${apiUrl}/wallet`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          Authorization: `Bearer ${token}`, // إرسال التوكن في الـ Header
        },
      });

      // 3. معالجة الاستجابة
      const data = await response.json();

      if (data.result === true && data.errNum === 200) {
        // استخراج الرصيد من البيانات
        // البيانات تأتي بصيغة "EGP 0.00" - نحتاج لفصل الرقم والعملة
        const balanceString = data.data.balance; // مثال: "EGP 371.56"
        const [currencyPart, balancePart] = balanceString.split(" ");
        
        setCurrency(currencyPart || "EGP");
        setBalance(parseFloat(balancePart) || 0);
      } else {
        throw new Error(data.message || "حدث خطأ أثناء جلب الرصيد");
      }
    } catch (err: any) {
      console.error("Error fetching wallet balance:", err);
      setError(err.message || "فشل في الاتصال بالخادم");
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
          <p className="text-gray-600">جاري تحميل رصيد المحفظة...</p>
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
              <FaChevronRight className="w-4 h-4" />
              <span>رجوع إلى حسابي</span>
            </Link>
          </div>
          <div className=" bg-blue-50  border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchWalletBalance}
              className="px-4 py-2 bg-[#ff3c27] text-white rounded-[8px]  hover:bg-[#e63520] transition"
            >
              إعادة المحاولة
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
            <FaChevronRight className="w-4 h-4" />
            <span>رجوع إلى حسابي</span>
          </Link>
          <h1 className="text-xl font-bold text-[#180100]">المحفظة</h1>
        </div>

        {/* بطاقة الرصيد - Wallet Card */}
        <div className="space-y-3 mb-6">
          <div className="relative overflow-hidden bg-card-wallet rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 w-fit">
                  <Image
                    src="/images/wallet.png"
                    alt="Wallet"
                    width={28}
                    height={28}
                    className="brightness-0 invert opacity-90"
                  />
                </div>
                <p className="text-white text-lg md:text-xl font-medium">
                  المحفظة
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="text-white text-xl font-medium">
                  الرصيد الحالي
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