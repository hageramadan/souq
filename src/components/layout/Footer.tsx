'use client'
import Image from "next/image";
import Link from "next/link";
import { MdEmail, MdPhone } from "react-icons/md";
import { useState, useEffect } from "react";
import { getCategories } from "@/services/api";
import { getSettings } from "@/services/settingsApi";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  id: number;
  name: string;
  href: string;
}

interface Settings {
  name: string;
  address: string;
  privacy_policy: string;
  terms_and_conditions: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  snapchat: string;
  instagram: string;
  whatsapp: string;
  email: string;
  phone: string;
}

// ✅ دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      categories: "Categories",
      new: "New",
      leastPrice: "Least Price",
      discounts: "Discounts",
      help: "Help",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      contactUs: "Contact Us",
      callUs: "Call Us",
      email: "Email",
      loading: "Loading...",
      noCategories: "No categories",
    };
  }
  // Arabic (default)
  return {
    categories: "الاقسام",
    new: "جديدنا",
    leastPrice: "اقل الاسعار",
    discounts: "الخصومات",
    help: "المساعدة",
    terms: "الشروط والاحكام",
    privacy: "سياسة الخصوصية",
    contactUs: "تواصل معنا",
    callUs: "اتصل بنا",
    email: "البريد الإلكتروني",
    loading: "جاري التحميل...",
    noCategories: "لا توجد فئات",
  };
};

export function Footer() {
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  // ✅ إضافة state لمنع Hydration Error
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // ✅ تعيين isMounted بعد تحميل العميل
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // جلب الفئات والإعدادات من API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getCategories();
        
        const transformedCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          href: `/products?categories=[${cat.id}]`
        }));
        
        setCategories(transformedCategories);

        setLoadingSettings(true);
        const settingsData = await getSettings();
        setSettings(settingsData.setting);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingCategories(false);
        setLoadingSettings(false);
      }
    };
    
    fetchData();
  }, []);

  // ✅ دالة موثوقة للتمرير مع الانتظار حتى ظهور العنصر
  const scrollToElement = (targetId: string) => {
    let targetElement = document.getElementById(targetId);
    
    if (!targetElement) {
     
      
      const intervalId = setInterval(() => {
        targetElement = document.getElementById(targetId);
        
        if (targetElement) {
         
          clearInterval(intervalId);
          
          const navbarHeight = document.querySelector('header')?.getBoundingClientRect().height || 80;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          window.history.pushState(null, '', '/');
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(intervalId);
        console.warn(`⚠️ لم يتم العثور على العنصر: #${targetId} بعد 5 ثواني`);
      }, 5000);
      
      return;
    }
    
    const navbarHeight = document.querySelector('header')?.getBoundingClientRect().height || 80;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    window.history.pushState(null, '', '/');
  };

  // ✅ دالة للتعامل مع النقر على الروابط
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
   
    
    if (pathname === '/') {
    
      scrollToElement(targetId);
    } else {
   
      router.push(`/#${targetId}`);
      
      setTimeout(() => {
        scrollToElement(targetId);
      }, 300);
    }
  };

  // ✅ التعامل مع التمرير عند تحميل الصفحة مع hash
  useEffect(() => {
    const handleHashChange = () => {
      if (pathname === '/' && window.location.hash) {
        const targetId = window.location.hash.replace('#', '');
      
        
        setTimeout(() => {
          scrollToElement(targetId);
        }, 500);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  // ✅ عرض النصوص المترجمة فقط بعد تحميل العميل
  if (!isMounted) {
    // ✅ عرض نسخة مبسطة أثناء التحميل على السيرفر (بدون نصوص مترجمة)
    return (
      <footer className="border-t mt-auto bg-[#112B40] text-white pt-5">
        <div className="container mx-auto px-4 py-12 bg-[#112B40]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-[#23A6F0] text-[84px] font-bold mb-4">
                <div className="w-48 h-48 bg-gray-700 animate-pulse rounded-lg"></div>
              </h3>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Loading...</h3>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Loading...</h3>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Loading...</h3>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t mt-auto bg-[#112B40] text-white pt-5">
      <div className="container mx-auto px-4 py-12 bg-[#112B40]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-[#23A6F0] text-[84px] font-bold mb-4">
              {loadingSettings ? (
                <div className="w-48 h-48 bg-gray-700 animate-pulse rounded-lg"></div>
              ) : (
                <Image
                  src="/images/logo.png"
                  alt={settings?.name || "Logo"}
                  width={2000}
                  height={800}
                  className="object-contain w-48 h-48"
                />
              )}
            </h3>
          </div>

          {/* Quick Links - Categories from API */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t.categories}</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/#new"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => handleLinkClick(e, 'new')}
                >
                  {t.new}
                </Link>
              </li>
              <li>
                <Link
                  href="/#least_price"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => handleLinkClick(e, 'least_price')}
                >
                  {t.leastPrice}
                </Link>
              </li>
              <li>
                <Link
                  href="/#discount"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => handleLinkClick(e, 'discount')}
                >
                  {t.discounts}
                </Link>
              </li>
              {loadingCategories ? (
                <li className="text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                    {t.loading}
                  </div>
                </li>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={category.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground text-sm">{t.noCategories}</li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t.help}</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {loadingSettings ? t.loading : settings?.terms_and_conditions || t.terms}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {loadingSettings ? t.loading : settings?.privacy_policy || t.privacy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t.contactUs}</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <MdPhone className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm">{t.callUs}</p>
                  <a 
                    href={`tel:${loadingSettings ? '' : settings?.phone || '0987654333'}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    dir="ltr"
                  >
                    {loadingSettings ? t.loading : settings?.phone || '0987654333'}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <MdEmail className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm">{t.email}</p>
                  <a 
                    href={`mailto:${loadingSettings ? '' : settings?.email || 'ecommerce@gmail.com'}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {loadingSettings ? t.loading : settings?.email || 'ecommerce@gmail.com'}
                  </a>
                </div>
              </li>
            </ul>
            <div className="flex gap-4 mt-5 md:mt-7 mb-[3rem]">
              {!loadingSettings && settings && (
                <>
                  <Link href={settings.linkedin || '#'}>
                    <Image
                      src="/images/social/linkedin.png"
                      alt="LinkedIn"
                      className="w-[24px] h-[24px]"
                      width={20000}
                      height={20000}
                    />
                  </Link>
                  <Link href={settings.snapchat || '#'}>
                    <Image
                      src="/images/social/snap.png"
                      alt="Snapchat"
                      className="w-[24px] h-[24px]"
                      width={2000}
                      height={2000}
                    />
                  </Link>
                  <Link href={settings.instagram || '#'}>
                    <Image
                      src="/images/social/insta.png"
                      alt="Instagram"
                      className="w-[24px] h-[24px]"
                      width={2000}
                      height={2000}
                    />
                  </Link>
                  <Link href={settings.facebook || '#'}>
                    <Image
                      src="/images/social/face.png"
                      alt="Facebook"
                      className="w-[24px] h-[24px]"
                      width={2000}
                      height={2000}
                    />
                  </Link>
                  <Link href={`https://wa.me/${settings.whatsapp?.replace('+', '') || ''}`}>
                    <Image
                      src="/images/social/wats.png"
                      alt="WhatsApp"
                      className="w-[24px] h-[24px]"
                      width={2000}
                      height={2000}
                    />
                  </Link>
                  <Link href="#">
                    <Image
                      src="/images/social/tiktok.png"
                      alt="TikTok"
                      className="w-[24px] h-[24px]"
                      width={2000}
                      height={2000}
                    />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}