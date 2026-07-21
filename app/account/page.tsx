"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaRegEdit } from "react-icons/fa";
import { TbChecklist } from "react-icons/tb";
import { TbTruckReturn } from "react-icons/tb";
import { SlLocationPin } from "react-icons/sl";
import { FaRegHeart } from "react-icons/fa";
import { 
  FaSignOutAlt, 
  FaChevronLeft,
  FaUser,
  FaTimes,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getHeaders } from "@/services/api";

export default function AccountPage() {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  const router = useRouter();
  const {language} = useLanguage()
  const { user, isAuthenticated, loading, logoutUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // حالات الرصيد
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletCurrency, setWalletCurrency] = useState<string>("");
  const [walletCurrencySymbol, setWalletCurrencySymbol] = useState<string>("ج.م"); // ✅ إضافة رمز العملة
  const [loadingWallet, setLoadingWallet] = useState<boolean>(true);

  // دالة مساعدة لمعالجة رابط الصورة
  const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;
    
    // إذا كان الرابط كاملًا (يبدأ بـ http أو https)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // إذا كان مسارًا نسبيًا
    return `https://admin.souqkaber.com${imagePath}`;
  };

  // دالة مساعدة لاستخراج الرصيد والعملة من البيانات القادمة من الـ API
  const parseBalance = (value: any): { currency: string; amount: number; symbol: string } => {
    // الحالة 1: قيمة نصية مثل "EGP 100.50"
    if (typeof value === 'string') {
      const parts = value.trim().split(/\s+/);
      if (parts.length === 2) {
        const currency = parts[0];
        const amount = parseFloat(parts[1]);
        if (!isNaN(amount)) {
          return { currency, amount, symbol: getCurrencySymbol(currency) };
        }
      }
      // محاولة استخراج الأرقام فقط إذا كانت العملة غير موجودة
      const numericMatch = value.match(/[\d.]+/);
      if (numericMatch) {
        return { currency: "EGP", amount: parseFloat(numericMatch[0]), symbol: "ج.م" };
      }
      return { currency: "EGP", amount: 0, symbol: "ج.م" };
    }
    
    // الحالة 2: قيمة رقمية
    if (typeof value === 'number') {
      return { currency: "EGP", amount: value, symbol: "ج.م" };
    }
    
    // الحالة 3: كائن يحتوي على balance و currency
    if (value && typeof value === 'object') {
      const currency = value.currency?.code || "EGP";
      const symbol = value.currency?.symbol || "ج.م";
      const amount = parseFloat(value.balance || value.amount || 0);
      return { currency, amount: isNaN(amount) ? 0 : amount, symbol };
    }
    
    // الحالة الافتراضية
    return { currency: "EGP", amount: 0, symbol: "ج.م" };
  };

  // ✅ دالة مساعدة للحصول على رمز العملة
  const getCurrencySymbol = (currencyCode: string): string => {
    const symbolMap: Record<string, string> = {
      "EGP": "ج.م",
      "USD": "$",
      "EUR": "€",
      "SAR": "ر.س",
      "AED": "د.إ",
      "KWD": "د.ك",
      "BHD": "د.ب",
      "QAR": "ر.ق",
      "OMR": "ر.ع",
      "JOD": "د.أ",
      "LBP": "ل.ل",
      "SYP": "ل.س",
    };
    return symbolMap[currencyCode] || currencyCode;
  };

  // دالة لجلب رصيد المحفظة من الـ API
  const fetchWalletBalance = async () => {
    setLoadingWallet(true);
    
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        console.warn("لم يتم العثور على توكن المصادقة");
        setLoadingWallet(false);
        return;
      }

      const apiUrl = "https://admin.souqkaber.com/api";
      const response = await fetch(`${apiUrl}/wallet`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (data.result === true && data.errNum === 200) {
        const balanceData = data.data;
        
        // استخدام الدالة المساعدة لتحليل البيانات بأمان
        const parsed = parseBalance(balanceData);
        setWalletCurrency(parsed.currency);
        setWalletCurrencySymbol(parsed.symbol);
        setWalletBalance(parsed.amount);
        
        // طباعة البيانات في الكونسول للتحقق (يمكنك إزالة هذا السطر في الإنتاج)
        console.log("Balance parsed:", parsed);
      } else {
        console.error("Error fetching wallet:", data.message);
        setWalletBalance(0);
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
      setWalletBalance(0);
    } finally {
      setLoadingWallet(false);
    }
  };

  // جلب الرصيد عند تحميل الصفحة
  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    
    await logoutUser();
    
    toast.success(t('account.logoutSuccess'), {
      duration: 2000,
      position: "top-center",
    });
    
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // ✅ قائمة عناصر القائمة مع ترجمة
  const menuItems = [
    {
      id: 1,
      title: t('account.myOrders'),
      icon: <TbChecklist className="w-5 h-5" />,
      href: "/account/orders",
    },
    {
      id: 2,
      title: t('account.myReturns'),
      icon: <TbTruckReturn className="w-5 h-5" />,
      href: "/account/returns",
    },
    {
      id: 3,
      title: t('account.savedAddresses'),
      icon: <SlLocationPin className="w-5 h-5" />,
      href: "/account/address",
    },
    {
      id: 4,
      title: t('account.wishlist'),
      icon: <FaRegHeart className="w-5 h-5" />,
      href: "/account/wishlist",
    },
  ];

  // عرض شاشة تحميل أثناء جلب بيانات المستخدم
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#23A6F0] rounded-full animate-spin mx-auto mb-4"></div>
          {/* <p className="text-gray-600">{t('account.loadingAccount')}</p> */}
        </div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل دخول، لا نعرض المحتوى
  if (!isAuthenticated || !user) {
    return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* أيقونة القفل أو المنع */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-[#23A6F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {t('account.welcomeMessage')}
          </h3>
          <p className="text-gray-600 mb-6 text-lg">
            {t('account.loginRequiredMessage')}{" "}
            <span className="text-[#23A6F0] font-semibold">{t('account.login')}</span>{" "}
            {t('account.toAccessProfile')}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full px-6 py-3 bg-[#23A6F0] text-white rounded-xl hover:bg-[#3b82f6] transition-all duration-300 font-semibold text-lg shadow-md hover:shadow-lg"
            >
              {t('account.loginNow')}
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-2 text-gray-600 hover:text-[#23A6F0] transition-colors duration-300 text-sm"
            >
              {t('account.backToHome')}
            </button>
          </div>
        </div>
        
        {/* رسالة تأكيد إضافية */}
        <p className="mt-4 text-sm text-gray-500">
          🔒 {t('account.protectedSection')}
        </p>
      </div>
    </div>
  );
  }

  // الحصول على الحرف الأول من اسم المستخدم للصورة الافتراضية
  const getUserInitial = () => {
    if (!user.name) return "U";
    return user.name.charAt(0).toUpperCase();
  };

  // الحصول على رابط الصورة
  const userImage = getImageUrl(user.image);

  // ✅ تنسيق عرض الرصيد مع رمز العملة
  const displayBalance = () => {
    if (loadingWallet) {
      return <span className="text-[#0A0500] text-base md:text-xl font-extrabold">{t('account.loadingBalance')}</span>;
    }
    if (walletBalance !== null) {
      return (
        <span className="text-[#0A0500] text-base md:text-xl font-extrabold">
           {walletBalance.toFixed(2)} {walletCurrencySymbol}
        </span>
      );
    }
    return <span className="text-[#0A0500] text-base md:text-xl font-extrabold"></span>;
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto pb-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#180100]">{t('account.myAccount')}</h1>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm px-4 py-2 mb-3 md:mb-8 flex flex-col md:flex-row justify-between md:items-center">
            <div className="flex items-center">
              {/* Profile Image - عرض الصورة من الـ API */}
              <div className="relative mb-4 md:mb-0">
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={user.name || "User"}
                    width={70}
                    height={70}
                    unoptimized
                    className="rounded-full object-cover h-16 w-16 md:w-24 md:h-24 border-4 border-white shadow-lg"
                    onError={() => {
                      // في حالة فشل تحميل الصورة، استخدم الحرف الأول
                      // يمكنك إضافة حالة للتعامل مع الخطأ
                    }}
                  />
                ) : (
                  <div className="h-16 w-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ff3c27] flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl md:text-2xl font-bold">
                      {getUserInitial()}
                    </span>
                  </div>
                )}
                <button 
                  onClick={() => router.push("/account/edit-profile")}
                  className="absolute bottom-0 start-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 transition"
                >
                  <FaRegEdit className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>

              {/* User Info - بيانات حقيقية من Context */}
              <div className="mr-2 md:mr-4">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {user.name || t('account.user')}
                </h2>
               
                {/* عرض رقم الهاتف مع كود الدولة */}
                {user.phone && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                    <span dir="ltr"> {user.country_code || '+20'} <></>
                      {user.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden md:flex gap-1 md:gap-3 h-fit mt-4 md:mt-0">
              <button
                onClick={() => router.push("/account/edit-profile")}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-[8px] hover:bg-gray-50 transition text-gray-700"
              >
                <FaRegEdit className="w-4 h-4" />
                <span>{t('account.editProfile')}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 rounded-[8px] hover:bg-red-50 transition text-red-600"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>{t('account.logout')}</span>
              </button>
            </div>
          </div>

          {/* Wallet Section - الرصيد من الـ API */}
          <div className="space-y-3 bg-wallet rounded-[8px] p-2 md:p-4 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-800">{t('account.wallet')}</h2>
            <Link
              href="/account/wallet"
              className="flex items-center justify-between bg-white rounded-[8px] p-3 lg:p-4 hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex items-center gap-2 md:gap-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <div className="text-gray-600">
                    <Image src="/images/wallet.png" alt={t('account.wallet')} width={20} height={20} />
                  </div>
                </div>
                <span className="text-gray-700 text-sm md:text-xl font-bold">{t('account.currentBalance')}</span>
              </div>
              {/* عرض الرصيد من الـ API مع رمز العملة */}
              {displayBalance()}
            </Link>
          </div>

          {/* Menu Items */}
          <div className="space-y-3 bg-white rounded-[8px] p-2 md:p-4 shadow-sm mb-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between bg-white rounded-[8px] p-4 hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <div className="text-gray-600">{item.icon}</div>
                  </div>
                  <span className="text-gray-700 text-base md:text-xl font-medium">{item.title}</span>
                </div>
                <FaChevronLeft className={`h-4 w-4 text-gray-400 ${isClient && language === 'en' ? 'rotate-180' : ''}`} />
              </Link>
            ))}
             <button
                onClick={handleLogout}
                className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 rounded-[8px] hover:bg-red-50 transition text-red-600"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>{t('account.logout')}</span>
              </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">{t('account.logoutConfirm')}</h3>
              <button
                onClick={cancelLogout}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <FaSignOutAlt className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-700 text-lg font-medium mb-2">
                  {t('account.logoutConfirmMessage')}
                </p>
                <p className="text-gray-500 text-sm">
                  {t('account.logoutWarning')}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition"
              >
                {t('account.cancel')}
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[8px] hover:bg-red-700 transition"
              >
                {t('account.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}