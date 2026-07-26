// // 'use client'
// // import React, { useState, useEffect, useCallback, useRef } from 'react'
// // import { Button } from '../ui/button'
// // import Link from 'next/link'
// // import { FaArrowLeft } from 'react-icons/fa'
// // import Image from 'next/image'
// // import { getAcceptLanguageHeader, getHeaders } from '@/services/api'
// // import { useLanguage } from '@/contexts/LanguageContext'

// // interface Ad {
// //   id: number;
// //   sub_title: string | null;
// //   name: string;
// //   description: string | null;
// //   link: string | null;
// //   image: string;
// //   is_active: number;
// // }

// // const API_BASE_URL = 'https://admin.souqkaber.com';

// // // ✅ دالة للحصول على الترجمات حسب اللغة (خارج المكون)
// // const getTranslations = (lang: string) => {
// //   if (lang === 'en') {
// //     return {
// //       limitedTime: "Limited Time",
// //       loading: "Loading...",
// //       error: "Sorry, an error occurred",
// //       retry: "Retry",
// //       noAds: "No ads available",
// //       previous: "Previous ad",
// //       next: "Next ad",
// //       goToAd: "Go to ad",
// //       shopNow: "Shop Now",
// //     };
// //   }
// //   // Arabic (default)
// //   return {
// //     limitedTime: "لفترة محدودة",
// //     loading: "جاري التحميل...",
// //     error: "عذراً، حدث خطأ",
// //     retry: "إعادة المحاولة",
// //     noAds: "لا توجد إعلانات متاحة",
// //     previous: "إعلان سابق",
// //     next: "إعلان تالي",
// //     goToAd: "الانتقال إلى الإعلان",
// //     shopNow: "تسوق الان",
// //   };
// // };

// // export function AdsHome() {
// //   const { language } = useLanguage();
// //   const t = getTranslations(language);
  
// //   // State for ads
// //   const [ads, setAds] = useState<Ad[]>([]);
// //   const [currentAdIndex, setCurrentAdIndex] = useState(0);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
  
// //   // ✅ استخدام ref لمنع الطلبات المتكررة
// //   const hasFetched = useRef(false);

// //   // ✅ دالة جلب الإعلانات (مستقرة باستخدام useCallback)
// //   const fetchAds = useCallback(async () => {
// //     // ✅ منع الطلبات المتكررة
// //     if (hasFetched.current) return;
    
// //     try {
// //       setIsLoading(true);
// //       setError(null);
      
// //       const response = await fetch(`${API_BASE_URL}/api/ads`, {
// //         method: 'GET',
// //         headers: getHeaders(false),
// //         cache: 'no-store',
// //         credentials: 'omit',
// //       });
      
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }
      
// //       const data = await response.json();
      
// //       if (data.errNum === 200 && data.result === true) {
// //         const activeAds = data.data.ad_pop_up.filter((ad: Ad) => ad.is_active === 1);
// //         setAds(activeAds);
// //         hasFetched.current = true; // ✅ تم الجلب بنجاح
// //       } else {
// //         throw new Error(data.message || t.error);
// //       }
// //     } catch (err) {
// //       console.error('Error fetching ads:', err);
// //       setError(err instanceof Error ? err.message : t.error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, [t]);

// //   // ✅ جلب الإعلانات عند تحميل المكون فقط (مرة واحدة)
// //   useEffect(() => {
// //     fetchAds();
// //   }, [fetchAds]);

// //   // ✅ التبديل التلقائي بين الإعلانات كل 5 ثواني
// //   useEffect(() => {
// //     if (ads.length <= 1) return;

// //     const interval = setInterval(() => {
// //       setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
// //     }, 5000);

// //     return () => clearInterval(interval);
// //   }, [ads.length]);

// //   const goToAd = (index: number) => {
// //     setCurrentAdIndex(index);
// //   };

// //   const nextAd = () => {
// //     setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
// //   };

// //   const prevAd = () => {
// //     setCurrentAdIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
// //   };

// //   // عرض حالة التحميل
// //   if (isLoading) {
// //     return (
// //       <div className=" ">
// //         <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 ">
// //           <div className="flex justify-center items-center min-h-[400px]">
// //             <div className="flex flex-col items-center gap-4">
// //               <div className="w-12 h-12 border-4 border-gray-300 border-t-[#23A6F0] rounded-full animate-spin"></div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // عرض حالة الخطأ
// //   if (error) {
// //     return (
// //      null
// //     );
// //   }

// //   // إذا لم توجد إعلانات
// //   if (ads.length === 0) {
// //     return (
// //       <section >
      
// //       </section>
// //     );
// //   }

// //   const currentAd = ads[currentAdIndex];

// //   return (
// //     <section className="">
// //       {ads.length > 0 &&(
// //  <div className="container-custom py-6 md:py-12 bg-white">
// //         <div className="bg-[#F2F8FD] rounded-2xl grid grid-cols-2 items-center justify-between px-2 md:px-10 py-6 md:py-8 relative overflow-hidden">
          
// //           {/* أزرار التنقل (إذا كان هناك أكثر من إعلان) */}
// //           {ads.length > 1 && (
// //             <>
// //               <button
// //                 onClick={prevAd}
// //                 className="absolute end-2 md:end-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 shadow-lg transition-all"
// //                 aria-label={t.previous}
// //               >
// //                 <FaArrowLeft className="h-4 w-4 md:h-6 md:w-6 text-[#23A6F0] rotate-180" />
// //               </button>
// //               <button
// //                 onClick={nextAd}
// //                 className="absolute start-2 md:start-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 shadow-lg transition-all"
// //                 aria-label={t.next}
// //               >
// //                 <FaArrowLeft className="h-4 w-4 md:h-6 md:w-6 text-[#23A6F0]" />
// //               </button>
// //             </>
// //           )}

// //           {/* محتوى الإعلان */}
// //           <div className="flex flex-col gap-2 md:gap-5 flex-1 z-10 px-4 md:px-0">
// //             {currentAd?.sub_title ? (
// //               <p className="text-[10px] md:text-[12px] font-semibold py-1 px-2 bg-[#FF995D] text-white w-fit rounded">
// //                 {currentAd.sub_title}
// //               </p>
// //             ) : (
// //               <p className="text-[8px] md:text-[16px] font-semibold py-0.5 px-1.5 md:px-3 text-[#BE4646] text-center md:text-right">
// //                 {t.limitedTime}
// //               </p>
// //             )}
            
// //             <h1 className="text-sm md:text-xl font-bold text-[#191C1F]">
// //               {currentAd?.name}
// //             </h1>
            
// //             {currentAd?.description ? (
// //               <p className="text-sm md:text-base text-[#191C1F] w-full md:w-[80%] leading-[1.5]">
// //                 {currentAd.description}
// //               </p>
// //             ) : null}
            
// //             <Button
// //               asChild
// //               aria-label={t.shopNow}
// //               className="w-fit md:w-[180px] md:h-[60px] animate-in text-[12px] md:text-[14px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl"
// //               style={{ backgroundColor: '#23A6F0' }}
// //             >
// //               <Link 
// //                 href={currentAd?.link ? currentAd.link : "/products"} 
// //                 className="flex items-center justify-center gap-2 text-white"
// //               >
// //                 {t.shopNow}
// //                 <FaArrowLeft className={`h-4 w-4 ${language === 'en' ? 'rotate-180' : ''}`} />
// //               </Link>
// //             </Button>
// //           </div>
          
// //           {/* صورة الإعلان */}
// //           <div className="mt-4 md:mt-0">
// //             <Image 
// //               src={currentAd?.image ? `${API_BASE_URL}${currentAd.image}` : "/images/sale.png"}
// //               alt={currentAd?.name || "Advertisement"}
// //               className="w-[250px] md:w-[416px] h-[150px] md:h-[304px] lg:w-[536px] lg:h-[424px] object-cover rounded-lg"
// //               width={2036}
// //               height={1424}
// //               priority
// //             />
// //           </div>
// //         </div>

// //         {/* مؤشرات التقدم (dots) للإعلانات المتعددة */}
// //         {ads.length > 1 && (
// //           <div className="flex justify-center gap-2 mt-4">
// //             {ads.map((_, index) => (
// //               <button
// //                 key={index}
// //                 onClick={() => goToAd(index)}
// //                 className={`transition-all duration-300 rounded-full ${
// //                   currentAdIndex === index
// //                     ? 'w-6 h-2 bg-black'
// //                     : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
// //                 }`}
// //                 aria-label={`${t.goToAd} ${index + 1}`}
// //               />
// //             ))}
// //           </div>
// //         )}
// //       </div>
   
// //       )}
// //        </section>
     
// //   )
// // }

// 'use client'
// import React, { useState, useEffect, useCallback, useRef } from 'react'
// import { Button } from '../ui/button'
// import Link from 'next/link'
// import { FaArrowLeft } from 'react-icons/fa'
// import Image from 'next/image'
// import { getAcceptLanguageHeader, getHeaders } from '@/services/api'
// import { useLanguage } from '@/contexts/LanguageContext'

// interface Ad {
//   id: number;
//   sub_title: string | null;
//   name: string;
//   description: string | null;
//   link: string | null;
//   image: string;
//   is_active: number;
// }

// const API_BASE_URL = 'https://admin.souqkaber.com';

// // ✅ دالة للحصول على الترجمات حسب اللغة (خارج المكون)
// const getTranslations = (lang: string) => {
//   if (lang === 'en') {
//     return {
//       limitedTime: "Limited Time",
//       loading: "Loading...",
//       error: "Sorry, an error occurred",
//       retry: "Retry",
//       noAds: "No ads available",
//       previous: "Previous ad",
//       next: "Next ad",
//       goToAd: "Go to ad",
//       shopNow: "Shop Now",
//     };
//   }
//   // Arabic (default)
//   return {
//     limitedTime: "لفترة محدودة",
//     loading: "جاري التحميل...",
//     error: "عذراً، حدث خطأ",
//     retry: "إعادة المحاولة",
//     noAds: "لا توجد إعلانات متاحة",
//     previous: "إعلان سابق",
//     next: "إعلان تالي",
//     goToAd: "الانتقال إلى الإعلان",
//     shopNow: "تسوق الان",
//   };
// };

// export function AdsHome() {
//   const { language } = useLanguage();
//   const t = getTranslations(language);
  
//   // State for ads
//   const [ads, setAds] = useState<Ad[]>([]);
//   const [currentAdIndex, setCurrentAdIndex] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // ✅ استخدام ref لمنع الطلبات المتكررة
//   const hasFetched = useRef(false);
//   const isMounted = useRef(true);

//   // ✅ دالة جلب الإعلانات (مستقرة باستخدام useCallback)
//   const fetchAds = useCallback(async () => {
//     // ✅ منع الطلبات المتكررة
//     if (hasFetched.current || !isMounted.current) return;
    
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const response = await fetch(`${API_BASE_URL}/api/ads`, {
//         method: 'GET',
//         headers: getHeaders(false),
//         cache: 'no-store',
//         credentials: 'omit',
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (isMounted.current) {
//         if (data.errNum === 200 && data.result === true) {
//           const activeAds = data.data.ad_pop_up.filter((ad: Ad) => ad.is_active === 1);
//           setAds(activeAds);
//           hasFetched.current = true; // ✅ تم الجلب بنجاح
//         } else {
//           throw new Error(data.message || t.error);
//         }
//       }
//     } catch (err) {
//       if (isMounted.current) {
//         console.error('Error fetching ads:', err);
//         setError(err instanceof Error ? err.message : t.error);
//       }
//     } finally {
//       if (isMounted.current) {
//         setIsLoading(false);
//       }
//     }
//   }, []); // ✅ dependency array فاضي عشان يتم إنشاء الدالة مرة واحدة فقط

//   // ✅ جلب الإعلانات عند تحميل المكون فقط (مرة واحدة)
//   useEffect(() => {
//     isMounted.current = true;
//     fetchAds();
    
//     return () => {
//       isMounted.current = false; // ✅ تنظيف عند unmount
//     };
//   }, [fetchAds]);

//   // ✅ التبديل التلقائي بين الإعلانات كل 5 ثواني
//   useEffect(() => {
//     if (ads.length <= 1) return;

//     const interval = setInterval(() => {
//       setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [ads.length]);

//   const goToAd = (index: number) => {
//     setCurrentAdIndex(index);
//   };

//   const nextAd = () => {
//     setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
//   };

//   const prevAd = () => {
//     setCurrentAdIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
//   };

//   // عرض حالة التحميل
//   if (isLoading) {
//     return (
//       <div className=" ">
//         <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 ">
//           <div className="flex justify-center items-center min-h-[400px]">
//             <div className="flex flex-col items-center gap-4">
//               <div className="w-12 h-12 border-4 border-gray-300 border-t-[#23A6F0] rounded-full animate-spin"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // عرض حالة الخطأ
//   if (error) {
//     return null;
//   }

//   // إذا لم توجد إعلانات
//   if (ads.length === 0) {
//     return (
//       <section>
      
//       </section>
//     );
//   }

//   const currentAd = ads[currentAdIndex];

//   return (
//     <section className="">
//       {ads.length > 0 && (
//         <div className="container-custom py-6 md:py-12 bg-white">
//           <div className="bg-[#F2F8FD] rounded-2xl grid grid-cols-2 items-center justify-between px-2 md:px-10 py-6 md:py-8 relative overflow-hidden">
            
//             {/* أزرار التنقل (إذا كان هناك أكثر من إعلان) */}
//             {ads.length > 1 && (
//               <>
//                 <button
//                   onClick={prevAd}
//                   className="absolute end-2 md:end-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 shadow-lg transition-all"
//                   aria-label={t.previous}
//                 >
//                   <FaArrowLeft className="h-4 w-4 md:h-6 md:w-6 text-[#23A6F0] rotate-180" />
//                 </button>
//                 <button
//                   onClick={nextAd}
//                   className="absolute start-2 md:start-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 shadow-lg transition-all"
//                   aria-label={t.next}
//                 >
//                   <FaArrowLeft className="h-4 w-4 md:h-6 md:w-6 text-[#23A6F0]" />
//                 </button>
//               </>
//             )}

//             {/* محتوى الإعلان */}
//             <div className="flex flex-col gap-2 md:gap-5 flex-1 z-10 px-4 md:px-0">
//               {currentAd?.sub_title ? (
//                 <p className="text-[10px] md:text-[12px] font-semibold py-1 px-2 bg-[#FF995D] text-white w-fit rounded">
//                   {currentAd.sub_title}
//                 </p>
//               ) : (
//                 <p className="text-[8px] md:text-[16px] font-semibold py-0.5 px-1.5 md:px-3 text-[#BE4646] text-center md:text-right">
//                   {t.limitedTime}
//                 </p>
//               )}
              
//               <h1 className="text-sm md:text-xl font-bold text-[#191C1F]">
//                 {currentAd?.name}
//               </h1>
              
//               {currentAd?.description ? (
//                 <p className="text-sm md:text-base text-[#191C1F] w-full md:w-[80%] leading-[1.5]">
//                   {currentAd.description}
//                 </p>
//               ) : null}
              
//               <Button
//                 asChild
//                 aria-label={t.shopNow}
//                 className="w-fit md:w-[180px] md:h-[60px] animate-in text-[12px] md:text-[14px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl"
//                 style={{ backgroundColor: '#23A6F0' }}
//               >
//                 <Link 
//                   href={currentAd?.link ? currentAd.link : "/products"} 
//                   className="flex items-center justify-center gap-2 text-white"
//                 >
//                   {t.shopNow}
//                   <FaArrowLeft className={`h-4 w-4 ${language === 'en' ? 'rotate-180' : ''}`} />
//                 </Link>
//               </Button>
//             </div>
            
//             {/* صورة الإعلان */}
//             <div className="mt-4 md:mt-0">
//               <Image 
//                 src={currentAd?.image ? `${API_BASE_URL}${currentAd.image}` : "/images/sale.png"}
//                 alt={currentAd?.name || "Advertisement"}
//                 className="w-[250px] md:w-[416px] h-[150px] md:h-[304px] lg:w-[536px] lg:h-[424px] object-cover rounded-lg"
//                 width={2036}
//                 height={1424}
//                 priority
//               />
//             </div>
//           </div>

//           {/* مؤشرات التقدم (dots) للإعلانات المتعددة */}
//           {ads.length > 1 && (
//             <div className="flex justify-center gap-2 mt-4">
//               {ads.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => goToAd(index)}
//                   className={`transition-all duration-300 rounded-full ${
//                     currentAdIndex === index
//                       ? 'w-6 h-2 bg-black'
//                       : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
//                   }`}
//                   aria-label={`${t.goToAd} ${index + 1}`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </section>
//   )
// }

// components/home/AdsHome.tsx

'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import Image from 'next/image'
import { getHeaders } from '@/services/api'
import { useLanguage } from '@/contexts/LanguageContext'

interface Ad {
  id: number;
  sub_title: string | null;
  name: string;
  description: string | null;
  link: string | null;
  image: string;
  is_active: number;
}

interface AdsHomeProps {
  onLoad?: () => void;
}

const API_BASE_URL = 'https://admin.souqkaber.com';

const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      limitedTime: "Limited Time",
      loading: "Loading...",
      error: "Sorry, an error occurred",
      retry: "Retry",
      noAds: "No ads available",
      previous: "Previous ad",
      next: "Next ad",
      goToAd: "Go to ad",
      shopNow: "Shop Now",
    };
  }
  return {
    limitedTime: "لفترة محدودة",
    loading: "جاري التحميل...",
    error: "عذراً، حدث خطأ",
    retry: "إعادة المحاولة",
    noAds: "لا توجد إعلانات متاحة",
    previous: "إعلان سابق",
    next: "إعلان تالي",
    goToAd: "الانتقال إلى الإعلان",
    shopNow: "تسوق الان",
  };
};

export function AdsHome({ onLoad }: AdsHomeProps) {
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  // ✅ استدعاء onLoad في useEffect وليس في render
  useEffect(() => {
    if (!isLoading && !isDataLoaded && onLoad) {
      setIsDataLoaded(true);
      onLoad();
    }
  }, [isLoading, isDataLoaded, onLoad]);

  const fetchAds = useCallback(async () => {
    if (hasFetched.current || !isMounted.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/ads`, {
        method: 'GET',
        headers: getHeaders(false),
        cache: 'no-store',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (isMounted.current) {
        if (data.errNum === 200 && data.result === true) {
          const activeAds = data.data.ad_pop_up.filter((ad: Ad) => ad.is_active === 1);
          setAds(activeAds);
          hasFetched.current = true;
        } else {
          throw new Error(data.message || t.error);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('Error fetching ads:', err);
        setError(err instanceof Error ? err.message : t.error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [t.error]);

  useEffect(() => {
    isMounted.current = true;
    fetchAds();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchAds]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const goToAd = (index: number) => {
    setCurrentAdIndex(index);
  };

  const nextAd = () => {
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-[#23A6F0] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ هنا بنرجع null من غير استدعاء onLoad
  if (error || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  return (
    <section>
      <div className="container-custom py-6 md:py-12 bg-white">
        <div className="bg-[#F2F8FD] rounded-2xl grid grid-cols-2 items-center justify-between px-2 md:px-10 py-6 md:py-8 relative overflow-hidden">
          
          {ads.length > 1 && (
            <>
              <button
                onClick={prevAd}
                className="absolute end-2 md:end-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 shadow-lg transition-all"
                aria-label={t.previous}
              >
                <FaArrowLeft className="h-4 w-4 md:h-6 md:w-6 text-[#23A6F0] rotate-180" />
              </button>
              <button
                onClick={nextAd}
                className="absolute start-2 md:start-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 shadow-lg transition-all"
                aria-label={t.next}
              >
                <FaArrowLeft className="h-4 w-4 md:h-6 md:w-6 text-[#23A6F0]" />
              </button>
            </>
          )}

          <div className="flex flex-col gap-2 md:gap-5 flex-1 z-10 px-4 md:px-0">
            {currentAd?.sub_title ? (
              <p className="text-[10px] md:text-[12px] font-semibold py-1 px-2 bg-[#FF995D] text-white w-fit rounded">
                {currentAd.sub_title}
              </p>
            ) : (
              <p className="text-[8px] md:text-[16px] font-semibold py-0.5 px-1.5 md:px-3 text-[#BE4646] text-center md:text-right">
                {t.limitedTime}
              </p>
            )}
            
            <h1 className="text-sm md:text-xl font-bold text-[#191C1F]">
              {currentAd?.name}
            </h1>
            
            {currentAd?.description && (
              <p className="text-sm md:text-base text-[#191C1F] w-full md:w-[80%] leading-[1.5]">
                {currentAd.description}
              </p>
            )}
            
            <Button
              asChild
              aria-label={t.shopNow}
              className="w-fit md:w-[180px] md:h-[60px] animate-in text-[12px] md:text-[14px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl"
              style={{ backgroundColor: '#23A6F0' }}
            >
              <Link 
                href={currentAd?.link ? currentAd.link : "/products"} 
                className="flex items-center justify-center gap-2 text-white"
              >
                {t.shopNow}
                <FaArrowLeft className={`h-4 w-4 ${language === 'en' ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Image 
              src={currentAd?.image ? `${API_BASE_URL}${currentAd.image}` : "/images/sale.png"}
              alt={currentAd?.name || "Advertisement"}
              className="w-[250px] md:w-[416px] h-[150px] md:h-[304px] lg:w-[536px] lg:h-[424px] object-cover rounded-lg"
              width={2036}
              height={1424}
              priority
            />
          </div>
        </div>

        {ads.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => goToAd(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentAdIndex === index
                    ? 'w-6 h-2 bg-black'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`${t.goToAd} ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}